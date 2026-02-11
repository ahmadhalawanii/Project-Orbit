# Orbit – Agent Build Rules (do not ignore)

You must read docs/ORBIT_SPEC.md before doing anything.

Goal: Generate the full working prototype repo (Next.js web + FastAPI API + SQLite + Chroma + docker-compose) exactly matching ORBIT_SPEC.

Hard constraints
- Stack: Next.js (App Router) + Tailwind + shadcn/ui (optional), FastAPI (Python), SQLite, Chroma PersistentClient.
- Implement ALL routes/endpoints described in ORBIT_SPEC, but you may stage them in phases (A→D) as long as you build the full system end-to-end.
- Every API must use typed Pydantic request/response models.
- RAG answers must be grounded in content_pack (or explain “not in provided content”) and return citations.
- Ignore any “oai_citation” / bracket citation artifacts inside ORBIT_SPEC.md (treat them as notes, not real sources).
- Keep everything runnable locally: docker-compose OR clear local run commands.

Quality gates
- After each phase, run commands to verify: backend starts, frontend starts, one happy-path call works.
- Prefer minimal dependencies. Don’t invent features outside ORBIT_SPEC.
Deliverables
- README with setup steps
- .env.example
- docker-compose.yml
