import uuid
import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Tracks active lecture WebSocket connections so we can push updates
    (transcript, notes, quiz progress) to the right client."""

    def __init__(self):
        self._active: dict[uuid.UUID, WebSocket] = {}

    async def connect(self, lecture_id: uuid.UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self._active[lecture_id] = websocket
        logger.info("WebSocket connected for lecture=%s", lecture_id)

    def disconnect(self, lecture_id: uuid.UUID) -> None:
        self._active.pop(lecture_id, None)
        logger.info("WebSocket disconnected for lecture=%s", lecture_id)

    async def send_json(self, lecture_id: uuid.UUID, payload: dict) -> None:
        ws = self._active.get(lecture_id)
        if ws is not None:
            await ws.send_json(payload)


manager = ConnectionManager()
