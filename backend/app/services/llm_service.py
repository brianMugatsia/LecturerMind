"""
Thin wrapper around the Anthropic Claude API for the two core generation tasks:
short notes from a transcript window, and multiple-choice quiz questions.
"""
import json
import logging

from anthropic import AsyncAnthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = logging.getLogger(__name__)

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

NOTES_SYSTEM_PROMPT = """You are an expert academic note-taker. Given a raw excerpt of \
a live-transcribed lecture, produce concise short notes capturing only the key ideas, \
definitions, and facts. Use terse markdown bullet points. Skip filler, repetition, and \
verbal tics from the transcript. Do not invent information that isn't in the text."""

QUIZ_SYSTEM_PROMPT = """You are an expert exam writer. Given lecture transcript/notes, \
generate multiple-choice quiz questions that test understanding of the key concepts \
actually covered. Each question must have exactly 4 choices with exactly one correct \
answer. Respond with ONLY valid JSON, no preamble, no markdown fences, matching this \
schema:
{
  "questions": [
    {
      "question": "string",
      "choices": ["string", "string", "string", "string"],
      "correct_index": 0,
      "explanation": "string, one sentence"
    }
  ]
}"""


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def generate_notes(transcript_window: str) -> str:
    """Generate short bullet-point notes from a window of transcript text."""
    response = await client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=500,
        system=NOTES_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": transcript_window}],
    )
    return response.content[0].text.strip()


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def generate_quiz(full_transcript: str, question_count: int = 10) -> list[dict]:
    """Generate `question_count` multiple-choice quiz questions from the full lecture transcript."""
    user_prompt = (
        f"Generate exactly {question_count} multiple-choice questions from this lecture "
        f"transcript:\n\n{full_transcript}"
    )
    response = await client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=4000,
        system=QUIZ_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    raw = response.content[0].text.strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        data = json.loads(raw)
        return data["questions"][:question_count]
    except (json.JSONDecodeError, KeyError) as e:
        logger.error("Failed to parse quiz JSON from Claude: %s | raw=%s", e, raw[:500])
        raise


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def answer_question(context_chunks: list[str], question: str, chat_history: list[dict]) -> str:
    """Answer a student's question using retrieved transcript context (RAG)."""
    context_text = "\n---\n".join(context_chunks) if context_chunks else "(no relevant context found)"
    system = (
        "You are a helpful teaching assistant. Answer the student's question using ONLY "
        "the lecture context provided below. If the answer isn't in the context, say so "
        "honestly rather than guessing.\n\nLECTURE CONTEXT:\n" + context_text
    )
    messages = chat_history + [{"role": "user", "content": question}]
    response = await client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=600,
        system=system,
        messages=messages,
    )
    return response.content[0].text.strip()
