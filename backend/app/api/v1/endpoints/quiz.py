import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.quiz import QuizQuestion
from app.crud.lecture import get_lecture
from app.schemas.quiz import QuizQuestionOut, QuizGenerateRequest
from app.services.quiz_service import generate_quiz_for_lecture

router = APIRouter(prefix="/lectures/{lecture_id}/quiz", tags=["quiz"])


@router.post("/generate", response_model=list[QuizQuestionOut], status_code=201)
async def generate_quiz(
    lecture_id: uuid.UUID,
    req: QuizGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = await get_lecture(db, lecture_id)
    if not lecture or lecture.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture not found")

    questions = await generate_quiz_for_lecture(db, lecture_id, req.question_count)
    if not questions:
        raise HTTPException(status_code=400, detail="No transcript available yet to generate a quiz")
    return questions


@router.get("", response_model=list[QuizQuestionOut])
async def list_quiz_questions(
    lecture_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = await get_lecture(db, lecture_id)
    if not lecture or lecture.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture not found")

    result = await db.execute(
        select(QuizQuestion)
        .where(QuizQuestion.lecture_id == lecture_id)
        .order_by(QuizQuestion.order)
    )
    return list(result.scalars().all())
