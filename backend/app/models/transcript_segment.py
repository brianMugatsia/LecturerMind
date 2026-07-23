import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, ForeignKey, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

try:
    from pgvector.sqlalchemy import Vector
    HAS_VECTOR = True
except ImportError:  # pgvector extension not installed yet
    HAS_VECTOR = False


class TranscriptSegment(Base):
    """A finalized chunk of transcribed speech, used both for display and RAG retrieval."""
    __tablename__ = "transcript_segments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lecture_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("lectures.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    start_ms: Mapped[int] = mapped_column(Integer, default=0)
    end_ms: Mapped[int] = mapped_column(Integer, default=0)
    is_final: Mapped[bool] = mapped_column(Boolean, default=True)
    embedding = mapped_column(Vector(1536), nullable=True) if HAS_VECTOR else None
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lecture: Mapped["Lecture"] = relationship(back_populates="segments")
