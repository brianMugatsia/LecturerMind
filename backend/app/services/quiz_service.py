import uuid
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transcript_segment import TranscriptSegment
from app.models.quiz import QuizQuestion
from app.services.llm_service import generate_quiz
from app.config import settings

logger = logging.getLogger(__name__)


async def generate_quiz_for_lecture(
    db: AsyncSession, lecture_id: uuid.UUID, question_count: int | None = None
) -> list[QuizQuestion]:
    """Generate a full quiz from the entire final transcript of a lecture."""
    question_count = question_count or settings.QUIZ_QUESTION_COUNT

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

    full_transcript = " ".join(s.text for s in segments)
    raw_questions = await generate_quiz(full_transcript, question_count)

    questions = []
    for i, q in enumerate(raw_questions):
        quiz_question = QuizQuestion(
            lecture_id=lecture_id,
            question=q["question"],
            choices=q["choices"],
            correct_index=q["correct_index"],
            explanation=q.get("explanation"),
            order=i,
        )
        db.add(quiz_question)
        questions.append(quiz_question)

    await db.commit()
    for q in questions:
        await db.refresh(q)

    logger.info("Generated %d quiz questions for lecture=%s", len(questions), lecture_id)
    return questions
