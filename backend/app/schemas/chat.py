import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.chat_message import MessageRole


class ChatRequest(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    role: MessageRole
    content: str
    created_at: datetime
