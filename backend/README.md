# LecturerMind Backend (FastAPI)

Real-time lecture transcription, short-notes generation, and quiz generation API.

## Stack
- **FastAPI** — REST + WebSocket
- **PostgreSQL** (+ pgvector) — persistence, future embedding-based RAG
- **Redis + Celery** — background jobs (bulk quiz generation, audio upload)
- **Deepgram** — real-time streaming speech-to-text
- **Claude (Anthropic API)** — notes generation, quiz generation, chat Q&A

## Local Setup

### 1. Environment variables
```bash
cp .env.example .env
# fill in DEEPGRAM_API_KEY and ANTHROPIC_API_KEY at minimum
```

### 2. Run with Docker (recommended)
```bash
docker compose up --build
```
This starts Postgres (with pgvector), Redis, the API (port 8000), and a Celery worker.

Then run migrations inside the running api container:
```bash
docker compose exec api alembic upgrade head
```

### 3. Or run locally without Docker
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# make sure Postgres + Redis are running locally and .env points to them
alembic upgrade head
uvicorn app.main:app --reload
```

In a second terminal, start the Celery worker:
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

### 4. Generate your first migration
Models already exist under `app/models/`. To create the initial migration:
```bash
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/auth/register` | POST | Create account |
| `/api/v1/auth/login` | POST | Get JWT access token (OAuth2 form) |
| `/api/v1/lectures` | POST | Start a new lecture session |
| `/api/v1/lectures` | GET | List your lectures |
| `/api/v1/lectures/{id}` | GET | Lecture detail + transcript segments |
| `/api/v1/lectures/{id}/end` | POST | Mark lecture as completed |
| `/api/v1/lectures/{id}/notes` | GET | List generated short notes |
| `/api/v1/lectures/{id}/quiz/generate` | POST | Generate 10-question quiz from full transcript |
| `/api/v1/lectures/{id}/quiz` | GET | List quiz questions |
| `/api/v1/lectures/{id}/chat` | POST | Ask a question (RAG over transcript) |
| `/api/v1/lectures/{id}/chat` | GET | Chat thread history |
| `/ws/lectures/{id}/stream?token=<jwt>` | WebSocket | Stream live audio, receive live transcript + notes |

## WebSocket Protocol

Connect to `/ws/lectures/{lecture_id}/stream?token=<jwt>` after creating a lecture via the REST endpoint.

**Client sends:**
- Binary frames: raw audio, 16kHz 16-bit PCM mono, ~250ms chunks
- Text frame `"END"` when recording stops

**Server sends (JSON):**
```json
{"type": "transcript", "text": "...", "is_final": true, "start_ms": 1200, "end_ms": 3400}
{"type": "notes", "content": "- point one\n- point two", "created_at": "..."}
{"type": "error", "detail": "..."}
```

The mobile app should render `type: transcript` events in the upper pane (append final
segments, replace the trailing interim text as it updates) and `type: notes` events in
the lower pane.

## Notes on Production Readiness

- **RAG retrieval** (`app/services/rag_service.py`) currently uses simple keyword-overlap
  retrieval so the chat feature works end-to-end without needing an embeddings provider
  configured. Swap in real embeddings (OpenAI/Voyage/etc.) + pgvector similarity search
  for better retrieval quality — the `TranscriptSegment.embedding` column is already
  there, just needs to be populated on segment insert.
- **CORS** is wide open (`allow_origins=["*"]`) for development — restrict this before
  shipping.
- **Notes debounce** interval is controlled by `NOTES_DEBOUNCE_SECONDS` in `.env`.
- Tests live in `tests/`; run with `pytest`.
