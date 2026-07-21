import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.note import Note
from app.crud.lecture import get_lecture
from app.schemas.note import NoteOut

router = APIRouter(prefix="/lectures/{lecture_id}/notes", tags=["notes"])


@router.get("", response_model=list[NoteOut])
async def list_notes(
    lecture_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = await get_lecture(db, lecture_id)
    if not lecture or lecture.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture not found")

    result = await db.execute(
        select(Note).where(Note.lecture_id == lecture_id).order_by(Note.created_at)
    )
    return list(result.scalars().all())
