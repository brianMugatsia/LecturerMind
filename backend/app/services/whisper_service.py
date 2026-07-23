from openai import OpenAI
from backend.app.core.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)


def transcribe_audio_file(file_path: str) -> str:
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )

    return transcript.text