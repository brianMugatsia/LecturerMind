import uuid
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.websockets import WebSocketState

from app.core.security import decode_access_token
from app.websocket.connection_manager import manager
from app.websocket.audio_pipeline import LectureAudioSession

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/lectures/{lecture_id}/stream")
async def stream_audio(websocket: WebSocket, lecture_id: uuid.UUID, token: str = Query(...)):
    """
    Client protocol:
      - Connect with ?token=<jwt>
      - Send raw binary audio frames (16kHz, 16-bit PCM, mono, ~250ms chunks)
      - Send the text message "END" to signal recording has stopped
    Server sends JSON messages back:
      { "type": "transcript", "text": ..., "is_final": bool, "start_ms": ..., "end_ms": ... }
      { "type": "notes", "content": ..., "created_at": ... }
      { "type": "error", "detail": ... }
    """
    user_id = decode_access_token(token)
    if user_id is None:
        await websocket.close(code=4401)
        return

    await manager.connect(lecture_id, websocket)
    session = LectureAudioSession(lecture_id)

    try:
        await session.start()
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                break

            if "bytes" in message and message["bytes"] is not None:
                await session.feed(message["bytes"])
            elif "text" in message and message["text"] == "END":
                break

    except WebSocketDisconnect:
        logger.info("Client disconnected from lecture=%s", lecture_id)
    except Exception:
        logger.exception("Error in audio stream for lecture=%s", lecture_id)
        if websocket.application_state == WebSocketState.CONNECTED:
            await websocket.send_json({"type": "error", "detail": "internal_error"})
    finally:
        await session.stop()
        manager.disconnect(lecture_id)
