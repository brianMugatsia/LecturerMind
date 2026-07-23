from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.flashcard_service import create_flashcard, get_flashcards
from app.core.database import get_db

router = APIRouter()

@router.post("/flashcards/")
def add_flashcard(question: str, answer: str, db: Session = Depends(get_db)):
    return create_flashcard(db, question, answer)

@router.get("/flashcards/")
def list_flashcards(db: Session = Depends(get_db)):
    return get_flashcards(db)
