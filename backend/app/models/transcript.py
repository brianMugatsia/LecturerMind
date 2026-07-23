from sqlalchemy import Column, Integer, Text
from backend.app.core.database import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
