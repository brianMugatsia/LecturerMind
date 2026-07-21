import uuid
import time
import logging

from app.db.session import AsyncSessionLocal
from app.models.transcript_segment import TranscriptSegment
from app.services.stt_service import DeepgramStreamingClient
from app.services.notes_service import generate_notes_for_window
from app.websocket.connection_manager import manager
from app.config import settings

logger = logging.getLogger(__name__)


class LectureAudioSession:
    """
    One instance per active recording lecture. Receives raw audio chunks from the
    client, streams them to Deepgram, persists finalized transcript segments, and
    triggers debounced note generation. Pushes live updates back to the client
    over the same WebSocket via the ConnectionManager.
    """

    def __init__(self, lecture_id: uuid.UUID):
        self.lecture_id = lecture_id
        self._last_notes_ms = 0
        self._latest_end_ms = 0
        self._stt: DeepgramStreamingClient | None = None

    async def start(self) -> None:
        self._stt = DeepgramStreamingClient(on_transcript=self._on_transcript)
        await self._stt.start()

    async def feed(self, chunk: bytes) -> None:
        await self._stt.send_audio(chunk)

    async def stop(self) -> None:
        if self._stt:
            await self._stt.finish()

    async def _on_transcript(self, text: str, is_final: bool, start_ms: int, end_ms: int) -> None:
        # Always push to client immediately for the live upper-section display,
        # whether interim or final, so text appears smoothly as the lecturer speaks.
        await manager.send_json(self.lecture_id, {
            "type": "transcript",
            "text": text,
            "is_final": is_final,
            "start_ms": start_ms,
            "end_ms": end_ms,
        })

        if not is_final:
            return

        # Persist final segments only.
        async with AsyncSessionLocal() as db:
            segment = TranscriptSegment(
                lecture_id=self.lecture_id,
                text=text,
                start_ms=start_ms,
                end_ms=end_ms,
                is_final=True,
            )
            db.add(segment)
            await db.commit()

        self._latest_end_ms = end_ms
        await self._maybe_generate_notes()

    async def _maybe_generate_notes(self) -> None:
        """Debounce: only regenerate notes once enough new final speech has
        accumulated, and run it without blocking the transcript stream."""
        elapsed_ms = self._latest_end_ms - self._last_notes_ms
        if elapsed_ms < settings.NOTES_DEBOUNCE_SECONDS * 1000:
            return

        since_ms = self._last_notes_ms
        self._last_notes_ms = self._latest_end_ms

        try:
            async with AsyncSessionLocal() as db:
                note = await generate_notes_for_window(db, self.lecture_id, since_ms)
            if note:
                await manager.send_json(self.lecture_id, {
                    "type": "notes",
                    "content": note.content,
                    "created_at": note.created_at.isoformat(),
                })
        except Exception:
            logger.exception("Failed to generate notes for lecture=%s", self.lecture_id)
