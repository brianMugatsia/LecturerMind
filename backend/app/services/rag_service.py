"""
Retrieval for the student chat/prompt feature.

For the MVP this uses a simple recency + keyword-overlap retrieval over transcript
segments, which is enough to get a working RAG chat loop end-to-end without needing
an embeddings provider configured. Swap `retrieve_context` for a pgvector similarity
query once embeddings are wired up (see TranscriptSegment.embedding + a background
task that embeds each final segment on arrival).
"""
import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transcript_segment import TranscriptSegment
from app.models.chat_message import ChatMessage, MessageRole

STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "of", "to", "in", "on", "for",
    "and", "or", "what", "how", "why", "does", "do", "did", "explain", "about",
}


def _keywords(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z']+", text.lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 2}


async def retrieve_context(
    db: AsyncSession, lecture_id: uuid.UUID, question: str, top_k: int = 8
) -> list[str]:
    result = await db.execute(
        select(TranscriptSegment)
        .where(
            TranscriptSegment.lecture_id == lecture_id,
            TranscriptSegment.is_final.is_(True),
        )
        .order_by(TranscriptSegment.start_ms)
    )
    segments = result.scalars().all()
    if not segments:
        return []

    q_keywords = _keywords(question)
    scored = []
    for seg in segments:
        seg_keywords = _keywords(seg.text)
        overlap = len(q_keywords & seg_keywords)
        scored.append((overlap, seg))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_matches = [s.text for score, s in scored[:top_k] if score > 0]

    # Always include the most recent segments too, for general "what did the lecturer
    # just say" style questions, even if no keyword overlap.
    recent = [s.text for s in segments[-4:]]

    combined = list(dict.fromkeys(top_matches + recent))  # dedupe, preserve order
    return combined[:top_k]


async def get_chat_history(
    db: AsyncSession, lecture_id: uuid.UUID, limit: int = 10
) -> list[dict]:
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.lecture_id == lecture_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))
    return [{"role": m.role.value, "content": m.content} for m in messages]


async def save_chat_message(
    db: AsyncSession, lecture_id: uuid.UUID, role: MessageRole, content: str
) -> ChatMessage:
    message = ChatMessage(lecture_id=lecture_id, role=role, content=content)
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
