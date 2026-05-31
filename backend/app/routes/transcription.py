from fastapi import APIRouter, UploadFile, File, Depends
import os
import uuid
from sqlalchemy.orm import Session

from backend.app.services.whisper_service import transcribe_audio_file
from backend.app.services.summary_service import generate_summary
from backend.app.services.quiz_service import generate_quiz
from backend.app.services.flashcard_service import generate_flashcards, save_flashcards
from backend.app.core.database import get_db
from backend.app.models.transcript import Transcript

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Create unique filename
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    # Save uploaded file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        # 1. Transcribe using Whisper
        transcript_text = transcribe_audio_file(file_path)

        # 2. Save transcript in DB
        transcript_obj = Transcript(content=transcript_text)
        db.add(transcript_obj)
        db.commit()
        db.refresh(transcript_obj)

        # 3. Generate AI Summary
        summary = generate_summary(transcript_text)

        # 4. Generate Quiz
        quiz = generate_quiz(transcript_text)

        # 5. Generate Flashcards with AI
        flashcards = generate_flashcards(transcript_text)

        # 6. Save Flashcards in DB linked to transcript
        saved_flashcards = save_flashcards(db, flashcards, transcript_obj.id)

        return {
            "filename": file.filename,
            "transcript": transcript_obj.content,
            "summary": summary,
            "quiz": quiz,
            "flashcards": saved_flashcards
        }

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
