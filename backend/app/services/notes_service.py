import uuid
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transcript_segment import TranscriptSegment
from app.models.note import Note
from app.services.llm_service import generate_notes

logger = logging.getLogger(__name__)


async def generate_notes_for_window(
    db: AsyncSession, lecture_id: uuid.UUID, since_ms: int
) -> Note:
    """Pull final transcript segments since `since_ms`, summarize into short notes, persist."""
    result = await db.execute(
        select(TranscriptSegment)
        .where(
            TranscriptSegment.lecture_id == lecture_id,
            TranscriptSegment.is_final.is_(True),
            TranscriptSegment.start_ms >= since_ms,
        )
        .order_by(TranscriptSegment.start_ms)
    )
    segments = result.scalars().all()
    if not segments:
        return None

    window_text = " ".join(s.text for s in segments)
    notes_content = await generate_notes(window_text)

    note = Note(lecture_id=lecture_id, content=notes_content)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    logger.info("Generated notes for lecture=%s (%d chars)", lecture_id, len(notes_content))
    return note
