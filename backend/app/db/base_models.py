"""
Import all SQLAlchemy models here so Alembic's autogenerate can discover them
via `Base.metadata`. This module is imported by alembic/env.py.
"""
from app.db.base import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.lecture import Lecture  # noqa: F401
from app.models.transcript_segment import TranscriptSegment  # noqa: F401
from app.models.note import Note  # noqa: F401
from app.models.quiz import QuizQuestion  # noqa: F401
from app.models.chat_message import ChatMessage  # noqa: F401
