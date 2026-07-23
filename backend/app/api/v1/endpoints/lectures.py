import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.lecture import LectureStatus
from app.schemas.lecture import LectureCreate, LectureOut, LectureDetailOut
from app.crud.lecture import (
    create_lecture, get_lecture, get_lecture_with_segments, list_lectures_for_user,
)

router = APIRouter(prefix="/lectures", tags=["lectures"])


@router.post("", response_model=LectureOut, status_code=201)
async def start_lecture(
    lecture_in: LectureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_lecture(db, current_user.id, lecture_in)


@router.get("", response_model=list[LectureOut])
async def list_lectures(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await list_lectures_for_user(db, current_user.id)


@router.get("/{lecture_id}", response_model=LectureDetailOut)
async def get_lecture_detail(
    lecture_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = await get_lecture_with_segments(db, lecture_id)
    if not lecture or lecture.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return lecture


@router.post("/{lecture_id}/end", response_model=LectureOut)
async def end_lecture(
    lecture_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone

    lecture = await get_lecture(db, lecture_id)
    if not lecture or lecture.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture not found")
    lecture.status = LectureStatus.completed
    lecture.ended_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(lecture)
    return lecture
