"""
Background tasks for heavier work that shouldn't block the WebSocket loop or an
HTTP request/response cycle - e.g. bulk quiz generation, audio upload to S3.

Note generation during a live lecture happens inline in the WebSocket pipeline
(see app/websocket/audio_pipeline.py) since it needs to push results back to the
client in near real time; these tasks are for the heavier, less latency-sensitive
jobs.
"""
import asyncio
import uuid
import logging

from app.workers.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.services.quiz_service import generate_quiz_for_lecture
from app.services.storage_service import upload_audio

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Celery workers are sync; run our async service functions in a fresh event loop."""
    return asyncio.run(coro)


@celery_app.task(name="tasks.generate_full_quiz")
def generate_full_quiz_task(lecture_id: str, question_count: int = 10):
    async def _run():
        async with AsyncSessionLocal() as db:
            questions = await generate_quiz_for_lecture(db, uuid.UUID(lecture_id), question_count)
            return len(questions)

    count = _run_async(_run())
    logger.info("generate_full_quiz_task: generated %d questions for lecture=%s", count, lecture_id)
    return count


@celery_app.task(name="tasks.upload_lecture_audio")
def upload_lecture_audio_task(lecture_id: str, file_bytes: bytes):
    url = upload_audio(uuid.UUID(lecture_id), file_bytes)
    logger.info("upload_lecture_audio_task: uploaded audio for lecture=%s -> %s", lecture_id, url)
    return url
