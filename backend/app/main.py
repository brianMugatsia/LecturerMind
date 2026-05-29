from fastapi import FastAPI
from backend.app.routes import transcription

app = FastAPI(
    title="LecturerMind AI Backend",
    version="1.0"
)

app.include_router(transcription.router)

@app.get("/")
def home():
    return {"message": "LecturerMind API is running 🚀"}