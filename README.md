# Project Orbit

Space-themed conversational hiring experience with RAG, Living Portfolio, Mission Packs, and AI interview.

## Stack
- **Frontend:** Next.js (App Router) + Tailwind
- **Backend:** FastAPI (Python)
- **DB:** SQLite (local)
- **Vector:** Chroma (PersistentClient)

## Repo layout
- `frontend/` contains the living-portfolio UI (used by `docker-compose.yml`).
- `backend/` contains the integrated AI agent backend.
- `apps/web/` contains an additional UI demo.

## Quick start (Docker)
1) Copy `.env.example` to `.env` and fill values if needed.
2) Start services:
   - `docker compose up --build`

- API: http://localhost:8001  
- Web: http://localhost:3001  

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

## Secrets
- Never commit `.env`. Use `.env.example` as a template.
