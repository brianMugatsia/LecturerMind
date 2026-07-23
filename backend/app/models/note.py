import uuid
from datetime import datetime

from sqlalchemy import DateTime, func, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Note(Base):
    """A short-notes summary generated from a window of transcript."""
    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lecture_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("lectures.id", ondelete="CASCADE"))
    content: Mapped[str] = mapped_column(Text, nullable=False)  # markdown bullet points
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lecture: Mapped["Lecture"] = relationship(back_populates="notes")
