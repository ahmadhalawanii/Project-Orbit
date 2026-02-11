According to an undated Space42 bounty brief, your prototype must: (1) be a conversational digital guide for candidates + new hires, (2) answer accurately from provided company/onboarding content, (3) demonstrate reasoning + explainability, (4) be deployable locally or with a simple cloud setup, and (5) ship as code + short deck (optional demo video). ￼ ￼

Below is the full end-to-end technical implementation for Project: Orbit (website + AI agent + Living Portfolio + Mission Packs + onboarding) that you can build in ~1.5 days.

⸻

Project: Orbit — Full technical implementation

0) Stack choice (fastest reliable build)

Frontend: Next.js (App Router) + Tailwind + shadcn/ui (or plain Tailwind)
Backend: FastAPI (Python) for RAG + portfolio + scoring APIs
Vector store: Chroma (local) for speed
DB: SQLite (via SQLModel/SQLAlchemy) for portfolios, users, runs, evidence metadata
LLM: OpenAI API (Responses API recommended) for chat + structured JSON outputs  ￼
RAG approach: retrieval + grounded answering  ￼
Deployment: Local (docker-compose) OR simple cloud (Vercel for Next + Render/Fly for FastAPI)

Why this matches the brief: deployable simply, documented external APIs, conversational quality + explainability + scalability story. ￼

⸻

1) High-level architecture (what runs where)

Services
	1.	Web app (Next.js)

	•	Chat UI (Candidate / New Hire toggle)
	•	Living Portfolio UI (candidate view)
	•	HR C ￼n)
	•	Mission Pack pages (role family packs)

	2.	Orbit API (FastAPI)

	•	/chat — multi-turn chat with RAG + citations
	•	/ingest — load Space42 content pack into Chroma
	•	/portfolio/* — create/update/read living portfolio
	•	/mission/* — mission pack templates + scoring
	•	/metrics/* — simple KPIs

	3.	Storage

	•	SQLite: users, conversations, portfolio, evidence, scores, audit log
	•	Chroma: embedded chunks of “Space42 content pack” + optionally mission pack instructions (read-only)

This implements “consistent info delivery at scale” and “practical enterprise HR context” while still prototype-light. ￼ ￼ ￼

⸻

2) Data model (minimum schema)

Tables (SQLite)

User
	•	id, email (or just name), r [oai_citation:11‡space42_challenge.pdf](sediment://file_00000000b028720a9ba208b17ee164e1) [oai_citation:12‡space42_challenge.pdf](sediment://file_00000000b028720a9ba208b17ee164e1) [oai_citation:13‡space42_challenge.pdf](sediment://file_00000000b028720a9ba208b17ee164e1)at

Message
	•	id, conversation_id, role = user|assistant|tool, content, created_at
	•	citations_json (array of {doc_id, title, chunk_id, snippet})

Portfolio
	•	id, user_id, target_roles (json), summary, preferences_json
	•	claims_json (list of {claim, evidence_ids[]})
	•	competency_json (rubric dims + notes + evidence)
	•	readiness_flags_json (visa timeline, availability date, etc.)
	•	updated_at

Evidence
	•	id, user_id, type = github|file|link|statement|mission_artifact
	•	url, label, notes, hash

MissionPack
	•	id, job_family (engineering/design/marketing/ops/etc.)
	•	brief_md, deliverables_json, allowed_artifacts_json
	•	rubric_mapping_json (how universal rubric dimensions map to evidence)

MissionRun
	•	id, user_id, mission_pack_id, team_id, started_at, ended_at
	•	artifact_index_json (links to PRs, docs, figma frames, etc.)

Score
	•	id, mission_run_id, total_0_10
	•	subscores: output_quality, impact, collaboration, ownership, communication
	•	evidence_anchors_json (each subscore -> evidence links)
	•	confidence, uncertainty_notes

This directly supports “reasoning + explainability” and “enterprise evolution” (auditable artifacts) without doing full enterprise security. ￼ ￼

⸻

3) RAG implementation (content-grounded answering)

3.1 Content pack ingestion

Input: a folder like content_pack/ containin ￼ ￼`
	•	role_families.md
	•	policies.md

Pipeline
	1.	Read files
	2.	Chunk text (e.g., 600–900 tokens, 80 overlap)
	3.	Embed chunks
	4.	Store in Chroma with metadata: {source, title, section}

Chroma is designed to run locally and is easy to get started with for vector retrieval prototypes.  ￼

3.2 Retrieval at chat time
	1.	Take user query + current mode
	2.	Retrieve top-k chunks (k=5–8)
	3.	Build answer prompt:
	•	System: “Answer only from retrieved context; if missing, ask for clarification or say you don’t know.”
	•	Provide retrieved snippets (with chunk ids)
	4.	Model returns:
	•	natural language answer
	•	structured citations[] referencing chunk ids
	5.	UI renders answer + “Sources” panel

RAG is explicitly a method to improve factual grounding by injecting external context at runtime.  ￼

⸻

4) The “Agent” behavior (Orbit orchestration)

You don’t need complex tool-calling; you need deterministic, judge-friendly behaviors:

Agent modes
	1.	Explore (Phase 0): answer FAQs about roles, process, culture using RAG.
	2.	Apply / Intake (Phase 1–2): ask adaptive questions and build Portfolio v1/v2.
	3.	Onboard (Phase 7): checklist Q&A + first-week roadmap using RAG.

Portfolio as the “single living product”

After each meaningful conversation turn:
	•	call a backend function: update_portfolio_from_conversation(user_id, recent_messages, evidence_links)
	•	have the model output JSON for the portfolio diff (strict schema)

Mission Sprint (Phase 3–4)

For prototype: don’t build full team workspace.
Instead:
	•	provide a Mission Pack page with instructions and a “Submit artifacts” form:
	•	GitHub repo link / PR links
	•	Doc link (Google Doc / Notion)
	•	Figma link
	•	Short reflection text
	•	scoring agent produces rubric breakdown + evidence anchors

AI interview (Phase 5)

A guided interview UI:
	•	question-by-question
	•	each question references portfolio items (“I see you claimed X—walk me through Y”)
	•	at end: Decision Pack JSON

This satisfies “practical application” and “innovation” while being buildable in time. ￼

⸻

5) API design (FastAPI)

FastAPI is well-suited for quickly building typed APIs with Python.  ￼

Endpoints

Ingestion
	•	POST /ingest (admin) → loads content_pack/ into Chroma

Chat
	•	POST /chat
	•	input: {user_id, conversation_id, mode, message}
	•	output: {answer, citations[], followups[], [oai_citation:22‡space42_challenge.pdf](sediment://file_00000000b028720a9ba208b17ee164e1) GET /portfolio/{user_id}`
	•	POST /portfolio/{user_id}/evidence (add link/file metadata)
	•	POST /portfolio/{user_id}/patch (apply JSON patch)

Mission Packs
	•	GET /mission/packs
	•	GET /mission/packs/{job_family}
	•	POST /mission/run/start
	•	POST /mission/run/{run_id}/submit_artifacts
	•	POST /mission/run/{run_id}/score

Interview
	•	POST /interview/start (generates interview plan from portfolio + job family)
	•	POST /interview/{id}/answer (next question)
	•	POST /interview/{id}/finalize (Decision Pack)

Metrics
	•	GET /metrics/hr (deflection, avg response time, completion counts)

⸻

6) Frontend routes (Next.js)

Next.js gives you a clean way to build the UI and route handlers / server actions if needed.  ￼

Pages
	•	/ Landing (Orbit map + “Start Mission”)
	•	/chat?mode=explore|apply|onboard
	•	/portfolio (candidate view)
	•	/hr (HR console)
	•	/mission (choose job family)
	•	/mission/[job_family] (Mission Pack + artifact submit)
	•	/interview (AI interview flow)

UI components
	•	ChatPanel
	•	SourcesDrawer (citations)
	•	PortfolioCard sections:
	•	Summary
	•	Evidence links
	•	Claims ↔ evidence anchors
	•	Competency map
	•	Readiness flags
	•	HR Candidate List (mock list is fine)
	•	RubricScoreBreakdown (0–10 + anchors)
	•	Mission Pack viewer (brief + deliverables)

⸻

7) Prompt contracts (make outputs stable)

7.1 Grounded Answer prompt (RAG)

Rules
	•	Use only retrieved snippets
	•	If insufficient: ask 1 clarifying question OR state “not in provided content”
	•	Return citations list with chunk ids

7.2 Portfolio Update prompt (strict JSON)

Return:

{
  "summary": "...",
  "target_roles": ["..."],
  "preferences": {"location": "...", "availability": "..."},
  "claims": [{"claim":"...", "evidence_ids":["..."], "source":"candidate_statement|link"}],
  "competencies": [{"dimension":"collaboration", "note":"...", "evidence_ids":["..."]}],
  "flags": [{"type":"availability", "note":"..."}]
}

7.3 Mission scoring prompt (universal rubric)

Return:
	•	subscores
	•	evidence anchors for each subscore
	•	uncertainty notes (“weak evidence for X”)

This is how you demonstrate “reasoning + explainability” in a prototype-friendly way. ￼

⸻

8) Repo structure (copy-paste target)

orbit/
  README.md
  docker-compose.yml
  .env.example

  apps/
    web/                  # Next.js
      app/
        page.tsx
        chat/page.tsx
        portfolio/page.tsx
        hr/page.tsx
        mission/page.tsx
        mission/[job_family]/page.tsx
        interview/page.tsx
      components/
      lib/api.ts
      tailwind.config.ts

  services/
    a [oai_citation:25‡space42_challenge.pdf](sediment://file_00000000b028720a9ba208b17ee164e1) main.py
      requirements.txt
      orbit/
        db.py
        models.py
        schemas.py
        rag/
          ingest.py
          retrieve.py
        agents/
          chat_agent.py
          portfolio_agent.py
          scoring_agent.py
          interview_agent.py
        routes/
          chat.py
          portfolio.py
          mission.py
          interview.py
          ingest.py
        utils/
          chunking.py
          citations.py

  content_pack/
    hiring_faq.md
    candidate_journey.md
    onboarding_checklist.md
    role_families.md
    policies.md


⸻

9) 36-hour build plan (what to implement in order)

Day 1 (AM) — “make it answer from content”
	1.	Scaffold FastAPI + SQLite + Chroma
	2.	Implement /ingest and /chat with citations
	3.	Basic Next.js chat page calling /chat

Day 1 (PM) — “make it produce the Living Portfolio”
	4.	Add portfolio tables + /portfolio/{user_id}
	5.	Implement portfolio update agent (JSON schema)
	6.	Build Portfolio UI that updates after chat turns

Day 1 (Night) — “Mission Packs + scoring”
	7.	Add MissionPack JSON templates (2 packs: Engineering + Marketing)
	8.	Build Mission Pack UI + artifact submission form
	9.	Implement scoring endpoint returning rubric + evidence anchors
	10.	HR page shows candidate list + “Decision Pack preview”

Day 2 (AM) — “AI interview + onboarding mode”
	11.	Interview flow: generate plan → Q/A → finalize Decision Pack
	12.	Onboarding mode: checklist Q&A grounded in content pack

Day 2 (PM) — polish + demo assets
	13.	Add KPI mini-panel (counts + averages)
	14.	Add Orbit “space map” UI wrapper (lightweight)
	15.	Record 2–3 min demo video + export deck

Your notes emphasize “sell the work” and “KPIs relevance,” so bake the KPI panel + crisp demo script.  ￼ ￼

⸻

10) What you must show in the demo (judge-proof checklist)
	•	Exploration Q&A shows citations from content pack (consistency at scale) ￼
	•	Intake conversation generates Living Portfolio v1/v2
	•	Mission Pack submission → 0–10 rubric score with evidence anchors
	•	AI interview generates Decision Pack + uncertainty notes
	•	** ￼ ￼ ￼

⸻

11) Minimal “enterprise-ready story” without implementing enterprise

Because the brief asks you to sh ￼e a slide + README section:
	•	content updates pipeline (re-ingest docs)
	•	role-based views (candidate vs HR)
	•	audit log records (messages + citations + score anchors)
	•	replace Chroma with managed vector DB later (optional)

This is explicitly part of the evaluation: “ ￼e environment.” ￼

⸻

Next message = I’ll give you the concrete build pack

If you tell me which path you prefer:
	•	A) “Fastest”: Next.js + FastAPI + Chroma + SQLite (recommended above)
	•	B) “All-in-one”: Next.js only (route handlers) + lightweight in-memory store

…I’ll respond with:
	1.	exact .env.example
	2.	docker-compose
	3.	FastAPI skeleton code for /ingest and /chat (with citation output)
	4.	Next.js cha ￼
	5.	Mission Pack JSON templates (Engineering + Marketing)
—all ready to paste into your repo.

(And we’ll keep it prototype-scope while still matching Space42’s required features.) ￼【88:0†space42_challenge.pdf†L44-L53】