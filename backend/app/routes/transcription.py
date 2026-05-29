from fastapi import APIRouter, UploadFile, File
import os
import uuid
from backend.app.services.whisper_service import transcribe_audio_file

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # Create unique filename
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    # Save uploaded file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Transcribe using Whisper
    transcript = transcribe_audio_file(file_path)

    # Cleanup file
    os.remove(file_path)

    return {
        "filename": file.filename,
        "transcript": transcript
    }