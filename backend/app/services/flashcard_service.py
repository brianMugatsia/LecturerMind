from sqlalchemy.orm import Session
from backend.app.models.flashcard import Flashcard
import openai

# --- AI Flashcard Generation ---
def generate_flashcards(transcript_text: str) -> list[dict]:
    """
    Use AI to generate flashcards from transcript text.
    Returns a list of dicts: [{"question": "...", "answer": "..."}]
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Generate study flashcards from transcript text. Format each as 'Q: ... A: ...'"},
            {"role": "user", "content": transcript_text}
        ]
    )

    content = response["choices"][0]["message"]["content"]

    flashcards = []
    lines = content.split("\n")
    question = None
    for line in lines:
        if line.startswith("Q:"):
            question = line.replace("Q:", "").strip()
        elif line.startswith("A:") and question:
            answer = line.replace("A:", "").strip()
            flashcards.append({"question": question, "answer": answer})
            question = None

    return flashcards


# --- Save Flashcards in DB ---
def save_flashcards(db: Session, flashcards: list[dict], transcript_id: int = None):
    """
    Save generated flashcards into the database.
    """
    saved = []
    for fc in flashcards:
        flashcard = Flashcard(
            question=fc["question"],
            answer=fc["answer"],
            transcript_id=transcript_id
        )
        db.add(flashcard)
        saved.append(flashcard)
    db.commit()
    return saved


# --- Fetch Flashcards ---
def get_flashcards(db: Session, transcript_id: int = None):
    """
    Retrieve flashcards from DB, optionally filtered by transcript_id.
    """
    query = db.query(Flashcard)
    if transcript_id:
        query = query.filter(Flashcard.transcript_id == transcript_id)
    return query.all()


# --- Create Flashcard Manually ---
def create_flashcard(db: Session, question: str, answer: str, transcript_id: int = None):
    """
    Create a single flashcard manually.
    """
    flashcard = Flashcard(
        question=question,
        answer=answer,
        transcript_id=transcript_id
    )
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    return flashcard
