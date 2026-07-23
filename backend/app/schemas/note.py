import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    content: str
    created_at: datetime
