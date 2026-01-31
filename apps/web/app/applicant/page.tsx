"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";

type PortfolioResponse = {
  user_id: string;
  summary?: string;
  target_roles: string[];
  claims: Array<{ claim: string }>;
  competencies: Array<{ dimension: string; note: string }>;
  flags: Array<{ type: string; note: string }>;
};

type Score = {
  total_0_10: number;
  subscores: Record<string, number | string>;
  evidence_anchors: Record<string, string>;
  uncertainty_notes?: string;
};

const missions = [
  {
    id: "ai-data",
    label: "AI / Data Science / ML Engineer",
    detail: "Machine learning, data pipelines, and AI systems.",
    jobFamily: "engineering"
  },
  {
    id: "geospatial",
    label: "Geospatial / Space-data Analyst",
    detail: "Geospatial insights, space-data analytics (Space42-relevant).",
    jobFamily: "engineering"
  },
  {
    id: "marketing",
    label: "Marketing / Growth",
    detail: "Marketing campaigns, growth, and analytics.",
    jobFamily: "marketing"
  },
  {
    id: "ops",
    label: "Operations / Program Management",
    detail: "Operations and program management.",
    jobFamily: "ops"
  },
  {
    id: "pm",
    label: "Product Manager",
    detail: "Product strategy, roadmaps, and cross-functional leadership.",
    jobFamily: "ops"
  },
  {
    id: "sales",
    label: "Sales / Business Development",
    detail: "Sales and business development.",
    jobFamily: "marketing"
  },
  {
    id: "satcom",
    label: "Satellite Communications / Network Engineer",
    detail: "Satellite communications and network engineering.",
    jobFamily: "engineering"
  },
  {
    id: "software",
    label: "Software Engineer (backend/full-stack)",
    detail: "Backend and full-stack development.",
    jobFamily: "engineering"
  }
];

const steps = [
  { id: "pluto", label: "Pluto", subtitle: "Onboarding & consent" },
  { id: "launchpad", label: "Launchpad", subtitle: "Tell me your story" },
  { id: "asteroid", label: "Asteroid Belt", subtitle: "Evidence capture" },
  { id: "spacewalk", label: "Spacewalk", subtitle: "Skills demonstration" },
  { id: "docking", label: "Docking Station", subtitle: "Collaboration" },
  { id: "mission", label: "Mission Control", subtitle: "Review & submit" }
];

export default function ApplicantJourneyPage() {
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [selectedMission, setSelectedMission] = useState(missions[0]);
  const [consentAi, setConsentAi] = useState(false);
  const [consentData, setConsentData] = useState(false);
  const [story, setStory] = useState("");
  const [storyResponse, setStoryResponse] = useState("");
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceList, setEvidenceList] = useState<
    Array<{ title: string; url: string }>
  >([]);
  const [score, setScore] = useState<Score | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const currentStep = steps[stepIndex];

  const canContinuePluto = consentAi && consentData;

  const missionFamily = useMemo(() => selectedMission.jobFamily, [selectedMission]);

  async function handleStorySend() {
    if (!story.trim()) return;
    const response = await apiPost<{ answer: string }>("/chat", {
      user_id: "u1",
      conversation_id: "applicant-journey",
      mode: "apply",
      message: story
    });
    setStoryResponse(response.answer);
  }

  async function handleAddEvidence() {
    if (!evidenceUrl.trim()) return;
    await apiPost("/portfolio/u1/evidence", {
      type: "link",
      url: evidenceUrl,
      label: evidenceTitle
    });
    setEvidenceList((prev) => [
      ...prev,
      { title: evidenceTitle || "Evidence", url: evidenceUrl }
    ]);
    setEvidenceTitle("");
    setEvidenceUrl("");
  }

  async function handleScoreMission() {
    const run = await apiPost<{ run_id: number }>("/mission/run/start", {
      user_id: "u1",
      job_family: missionFamily === "ops" ? "engineering" : missionFamily
    });
    const result = await apiPost<Score>(`/mission/run/${run.run_id}/score`, {
      artifacts: [
        {
          type: "github",
          url: evidenceList[0]?.url || "https://github.com/example/repo"
        }
      ],
      reflection:
        "Focused on delivering a concise solution and documenting tradeoffs."
    });
    setScore(result);
  }

  async function handleLoadPortfolio() {
    const data = await apiGet<PortfolioResponse>("/portfolio/u1");
    setPortfolio(data);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm text-blue-300" href="/">
          ← Back to Orbit
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Applicant Journey</h1>
        <p className="mt-2 text-slate-300">
          Start your space mission. No long forms — we&apos;ll guide you through
          conversation and evidence.
        </p>

        <div className="mt-6 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          {!journeyStarted && (
            <>
              <label className="text-sm text-slate-300">Email (demo)</label>
              <input
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-100"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <div className="mt-4">
                <div className="text-sm font-semibold">Choose your mission (role)</div>
                <div className="mt-3 space-y-3">
                  {missions.map((mission) => (
                    <button
                      key={mission.id}
                      className={`w-full rounded-xl border px-4 py-3 text-left ${
                        selectedMission.id === mission.id
                          ? "border-indigo-400 bg-indigo-500/10"
                          : "border-slate-800 bg-slate-950"
                      }`}
                      onClick={() => setSelectedMission(mission)}
                    >
                      <div className="text-sm font-semibold">{mission.label}</div>
                      <div className="text-xs text-slate-400">{mission.detail}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="mt-6 w-full rounded-lg bg-indigo-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
                disabled={!selectedMission}
                onClick={() => {
                  setJourneyStarted(true);
                  setStepIndex(0);
                }}
              >
                Launch mission
              </button>
            </>
          )}

          {journeyStarted && (
            <>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    className={`rounded-full px-3 py-1 ${
                      index === stepIndex
                        ? "bg-indigo-500/20 text-indigo-200"
                        : "bg-slate-950 text-slate-400"
                    }`}
                    onClick={() => setStepIndex(index)}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <div className="text-lg font-semibold">
                  {currentStep.label} — {currentStep.subtitle}
                </div>

                {currentStep.id === "pluto" && (
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={consentAi}
                        onChange={(event) => setConsentAi(event.target.checked)}
                      />
                      I understand AI helps extract and structure my answers into a portfolio.
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={consentData}
                        onChange={(event) => setConsentData(event.target.checked)}
                      />
                      I consent to data processing for this application.
                    </label>
                    <button
                      className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      disabled={!canContinuePluto}
                      onClick={() => setStepIndex(1)}
                    >
                      Continue to Launchpad
                    </button>
                  </div>
                )}

                {currentStep.id === "launchpad" && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm text-slate-300">
                      Tell me your story in a few sentences — what brought you here and
                      what role you&apos;re aiming for?
                    </div>
                    <textarea
                      className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-100"
                      rows={4}
                      value={story}
                      onChange={(event) => setStory(event.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
                        onClick={handleStorySend}
                      >
                        Send
                      </button>
                      <button
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
                        onClick={() => setStepIndex(2)}
                      >
                        Continue to Asteroid Belt
                      </button>
                    </div>
                    {storyResponse && (
                      <div className="rounded-lg bg-slate-900 p-3 text-sm text-slate-200">
                        {storyResponse}
                      </div>
                    )}
                  </div>
                )}

                {currentStep.id === "asteroid" && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm text-slate-300">
                      Add evidence: GitHub, Drive, Notion, or any link.
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <input
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-slate-100"
                        placeholder="Title (optional)"
                        value={evidenceTitle}
                        onChange={(event) => setEvidenceTitle(event.target.value)}
                      />
                      <input
                        className="flex-[2] rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-slate-100"
                        placeholder="https://..."
                        value={evidenceUrl}
                        onChange={(event) => setEvidenceUrl(event.target.value)}
                      />
                      <button
                        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
                        onClick={handleAddEvidence}
                      >
                        Add link
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-slate-400">
                      {evidenceList.map((item) => (
                        <div key={item.url}>
                          {item.title}: {item.url}
                        </div>
                      ))}
                    </div>
                    <button
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
                      onClick={() => setStepIndex(3)}
                    >
                      Continue to Spacewalk
                    </button>
                  </div>
                )}

                {currentStep.id === "spacewalk" && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm text-slate-300">
                      Lightweight challenges from your Mission Pack. For this restore,
                      we skip live challenges.
                    </div>
                    <button
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
                      onClick={handleScoreMission}
                    >
                      Generate mission score
                    </button>
                    {score && (
                      <div className="rounded-lg bg-slate-900 p-3 text-sm text-slate-200">
                        Score: {score.total_0_10} — {score.uncertainty_notes}
                      </div>
                    )}
                    <button
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
                      onClick={() => setStepIndex(4)}
                    >
                      Continue to Docking Station
                    </button>
                  </div>
                )}

                {currentStep.id === "docking" && (
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div>
                      Here you&apos;d complete an async collaboration exercise. For this
                      restore we skip it.
                    </div>
                    <button
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
                      onClick={() => setStepIndex(5)}
                    >
                      Continue to Mission Control
                    </button>
                  </div>
                )}

                {currentStep.id === "mission" && (
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div>
                      We&apos;ve built a candidate portfolio from your conversation and
                      evidence. Review when ready, then submit.
                    </div>
                    <button
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
                      onClick={handleLoadPortfolio}
                    >
                      Load portfolio
                    </button>
                    {portfolio && (
                      <div className="rounded-lg bg-slate-900 p-3 text-sm text-slate-200">
                        <div className="font-semibold">Summary</div>
                        <div className="text-slate-300">
                          {portfolio.summary || "No summary yet."}
                        </div>
                      </div>
                    )}
                    <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">
                      Submit application
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
