import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.chat_message import ChatMessage, MessageRole
from app.crud.lecture import get_lecture
from app.schemas.chat import ChatRequest, ChatMessageOut
from app.services.rag_service import retrieve_context, get_chat_history, save_chat_message
from app.services.llm_service import answer_question

router = APIRouter(prefix="/lectures/{lecture_id}/chat", tags=["chat"])


@router.post("", response_model=ChatMessageOut)
async def ask_question(
    lecture_id: uuid.UUID,
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = await get_lecture(db, lecture_id)
    if not lecture or lecture.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture not found")

    await save_chat_message(db, lecture_id, MessageRole.user, req.message)

    context_chunks = await retrieve_context(db, lecture_id, req.message)
    history = await get_chat_history(db, lecture_id)

    answer = await answer_question(context_chunks, req.message, history[:-1])  # exclude just-added msg
    assistant_message = await save_chat_message(db, lecture_id, MessageRole.assistant, answer)
    return assistant_message


@router.get("", response_model=list[ChatMessageOut])
async def get_chat_thread(
    lecture_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lecture = await get_lecture(db, lecture_id)
    if not lecture or lecture.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lecture not found")

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.lecture_id == lecture_id)
        .order_by(ChatMessage.created_at)
    )
    return list(result.scalars().all())
