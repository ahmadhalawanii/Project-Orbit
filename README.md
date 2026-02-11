# Project Orbit

Project Orbit is a space-themed hiring platform with an AI-enabled FastAPI backend and a Next.js frontend.

## Prerequisites

- Docker Desktop (Docker Engine + Docker Compose)
- Git
- Optional (for non-Docker run): Python 3.11+, Node.js 20+, npm

## Environment Setup

Primary Docker run uses `backend/.env` (via `docker-compose.yml`).

### 1) Create env file

Git Bash:

```bash
cp backend/.env.example backend/.env
```

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

### 2) Required/available variables in `backend/.env.example`

- `DATABASE_URL` (optional): database connection string for backend.
- `SECRET_KEY`: app auth/signing secret (change in production).
- `OPENAI_API_KEY` (recommended): OpenAI key for real AI responses.
- `MOCK_AI`: `true` uses mock AI responses; `false` uses OpenAI.
- `CORS_ORIGINS` (optional): allowed frontend origins.

Note: in Docker, `DATABASE_URL` is set by `docker-compose.yml` to `sqlite+aiosqlite:///./data/orbit.db`.

## Run With Docker (Primary)

From repo root:

```bash
docker compose up -d --build
```

App URLs:

- Web: `http://localhost:3001`
- API health: `http://localhost:8001/health`

Stop services:

```bash
docker compose down
```

Reset local runtime data (optional, destructive to local DB/vector/uploads):

```bash
docker compose down
rm -rf data uploads
```

PowerShell equivalent:

```powershell
docker compose down
Remove-Item -Recurse -Force .\data, .\uploads
```

## Run Without Docker (Optional)

### Backend

```bash
cd backend
python -m venv .venv
```

Activate and install:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm ci
npm run dev -- --hostname 0.0.0.0 --port 3000
```

## Common Issues

- Missing `OPENAI_API_KEY`: set key in `backend/.env` or keep `MOCK_AI=true`.
- Port already in use: change host ports in `docker-compose.yml` or free ports 3001/8001.
- Docker not running: start Docker Desktop, then rerun `docker compose up -d --build`.
