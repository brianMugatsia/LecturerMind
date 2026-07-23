import uuid
from pydantic import BaseModel, ConfigDict


class QuizQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    question: str
    choices: list[str]
    correct_index: int
    explanation: str | None
    order: int


class QuizGenerateRequest(BaseModel):
    question_count: int = 10
