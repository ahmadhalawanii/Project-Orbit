# Orbit

Space-themed conversational hiring experience: applicant journey (planet stages) and recruiter cockpit.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind, shadcn-style UI
- **Backend:** FastAPI, SQLAlchemy (async), SQLite (local) or Postgres (Docker)
- **Auth:** Demo / magic-link style

## Quick start (local)

1. **Backend**
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env   # edit .env if needed (API key, etc.)
   python -m scripts.init_db
   uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:3000

## Docker

From repo root:

```bash
cp backend/.env.example backend/.env   # edit if needed
docker compose up --build
```

- API: http://localhost:8000  
- Web: http://localhost:3000  
- Postgres: localhost:5432 (orbit/orbit/orbit)

## Secrets

- Never commit `.env`. Use `backend/.env.example` as a template.
- Set `SECRET_KEY` and optionally `OPENAI_API_KEY` in `backend/.env`.
