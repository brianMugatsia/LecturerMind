from fastapi import APIRouter

from app.api.v1.endpoints import auth, lectures, notes, quiz, chat

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(lectures.router)
api_router.include_router(notes.router)
api_router.include_router(quiz.router)
api_router.include_router(chat.router)
