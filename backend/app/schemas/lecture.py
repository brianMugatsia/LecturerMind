import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.lecture import LectureStatus


class LectureCreate(BaseModel):
    title: str = "Untitled Lecture"


class LectureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    status: LectureStatus
    audio_url: str | None
    created_at: datetime
    ended_at: datetime | None


class TranscriptSegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    text: str
    start_ms: int
    end_ms: int
    is_final: bool
    created_at: datetime


class LectureDetailOut(LectureOut):
    segments: list[TranscriptSegmentOut] = []
