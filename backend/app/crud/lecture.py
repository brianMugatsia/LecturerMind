import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.lecture import Lecture
from app.schemas.lecture import LectureCreate


async def create_lecture(db: AsyncSession, owner_id: uuid.UUID, lecture_in: LectureCreate) -> Lecture:
    lecture = Lecture(owner_id=owner_id, title=lecture_in.title)
    db.add(lecture)
    await db.commit()
    await db.refresh(lecture)
    return lecture


async def get_lecture(db: AsyncSession, lecture_id: uuid.UUID) -> Lecture | None:
    result = await db.execute(select(Lecture).where(Lecture.id == lecture_id))
    return result.scalar_one_or_none()


async def get_lecture_with_segments(db: AsyncSession, lecture_id: uuid.UUID) -> Lecture | None:
    result = await db.execute(
        select(Lecture)
        .options(selectinload(Lecture.segments))
        .where(Lecture.id == lecture_id)
    )
    return result.scalar_one_or_none()


async def list_lectures_for_user(db: AsyncSession, owner_id: uuid.UUID) -> list[Lecture]:
    result = await db.execute(
        select(Lecture).where(Lecture.owner_id == owner_id).order_by(Lecture.created_at.desc())
    )
    return list(result.scalars().all())
