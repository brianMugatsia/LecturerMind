from sqlalchemy import Column, Integer, Text, ForeignKey
from backend.app.core.database import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"), nullable=True)
