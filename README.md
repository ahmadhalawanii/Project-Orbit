# Project Orbit

Prototype for a conversational candidate/new-hire guide with RAG, Living Portfolio, Mission Packs, and AI interview.

## Stack
- Web: Next.js (App Router) + Tailwind
- API: FastAPI (Python)
- DB: SQLite
- Vector: Chroma (PersistentClient)

## Local setup
1) Copy `.env.example` to `.env` and fill values.
2) Start services:
   - `docker compose up --build`

## Local dev (optional)
Backend:
- `cd services/api`
- `python -m venv .venv`
- `./.venv/Scripts/Activate.ps1`
- `pip install -r requirements.txt`
- `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

Frontend:
- `cd apps/web`
- `npm install`
- `npm run dev -- --hostname 0.0.0.0 --port 3000`

## Verify
1) Ingest content:
   - `curl -X POST http://localhost:8000/ingest`
2) Chat:
   - `curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d "{\"user_id\":\"u1\",\"conversation_id\":\"c1\",\"mode\":\"explore\",\"message\":\"What are the role families?\"}"`

