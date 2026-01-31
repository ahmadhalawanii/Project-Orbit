"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getApplication,
  getPortfolio,
  generatePortfolio,
  listEvidence,
  addEvidence,
  getScore,
  calculateScore,
} from "@/lib/api";
import type { Application, Portfolio as PortfolioType, Evidence, RubricScore } from "@/lib/api";

const STAGE_LABELS: Record<string, string> = {
  pluto: "Pluto",
  mercury: "Mercury",
  asteroid_belt: "Asteroid Belt",
  mars: "Mars",
  saturn: "Saturn",
  earth: "Earth",
  launchpad: "Mercury",
  spacewalk: "Mars",
  docking_station: "Saturn",
  mission_control: "Earth",
};

export default function RecruiterApplicationPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  const [app, setApp] = useState<Application | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [score, setScore] = useState<RubricScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEvidenceTitle, setNewEvidenceTitle] = useState("");
  const [newEvidenceUrl, setNewEvidenceUrl] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getApplication(applicationId)
      .then((data) => {
        setApp(data);
        setError(null);
        return Promise.all([
          getPortfolio(applicationId).then(setPortfolio).catch(() => setPortfolio(null)),
          listEvidence(applicationId).then(setEvidence).catch(() => setEvidence([])),
          getScore(applicationId).then(setScore).catch(() => setScore(null)),
        ]);
      })
      .catch(() => setError("Application not found."))
      .finally(() => setLoading(false));
  }, [applicationId]);

  async function handleGeneratePortfolio() {
    setPortfolioLoading(true);
    try {
      const p = await generatePortfolio(applicationId);
      setPortfolio(p);
    } catch {
      setError("Failed to generate portfolio.");
    } finally {
      setPortfolioLoading(false);
    }
  }

  async function handleCalculateScore() {
    setScoreLoading(true);
    setError(null);
    try {
      const s = await calculateScore(applicationId);
      setScore(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to calculate score.";
      setError(msg);
    } finally {
      setScoreLoading(false);
    }
  }

  async function handleAddEvidence() {
    const title = newEvidenceTitle.trim() || undefined;
    const url_or_path = newEvidenceUrl.trim() || undefined;
    if (!url_or_path) return;
    try {
      const e = await addEvidence(applicationId, { kind: "link", title, url_or_path });
      setEvidence((prev) => [e, ...prev]);
      setNewEvidenceTitle("");
      setNewEvidenceUrl("");
    } catch {
      setError("Failed to add evidence.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6 bg-[#0a0a0f] text-[#e8e6e3]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#e8e6e3]/70">Loading application…</p>
        </div>
      </main>
    );
  }

  if (error || !app) {
    return (
      <main className="min-h-screen p-6 bg-[#0a0a0f] text-[#e8e6e3]">
        <div className="max-w-4xl mx-auto">
          <Link href="/recruiter/pipeline" className="text-[#22d3ee] hover:underline text-sm mb-4 inline-block">
            ← Pipeline
          </Link>
          <p className="text-[#f97316]">{error || "Application not found."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-[#0a0a0f] text-[#e8e6e3]">
      <div className="max-w-4xl mx-auto">
        <Link href="/recruiter/pipeline" className="text-[#22d3ee] hover:underline text-sm mb-4 inline-block">
          ← Pipeline
        </Link>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Application: {app.role_title ?? app.id}</h1>
          <p className="text-[#e8e6e3]/70 text-sm mt-1">
            Stage: {STAGE_LABELS[app.current_stage] ?? app.current_stage} · Status: {app.status}
          </p>
        </div>

        {/* Portfolio */}
        <section className="mb-8 rounded-xl border border-[#e8e6e3]/20 bg-[#1e1b4b]/30 p-6">
          <h2 className="text-lg font-semibold text-[#22d3ee] mb-3">Candidate portfolio</h2>
          {portfolio ? (
            <div className="space-y-3">
              {portfolio.summary && (
                <p className="text-[#e8e6e3]/90 text-sm whitespace-pre-wrap">{portfolio.summary}</p>
              )}
              {portfolio.structured_json && typeof portfolio.structured_json === "object" && (
                <div className="rounded-lg border border-[#e8e6e3]/10 bg-[#0a0a0f]/50 p-4 text-sm">
                  {Array.isArray((portfolio.structured_json as Record<string, unknown>).highlights) && (
                    <div className="mb-2">
                      <span className="font-medium text-[#e8e6e3]/80">Highlights:</span>
                      <ul className="list-disc list-inside mt-1 text-[#e8e6e3]/80">
                        {((portfolio.structured_json as Record<string, unknown>).highlights as string[]).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-[#e8e6e3]/60 text-sm mb-3">
                Generate a portfolio from this application&apos;s conversation and evidence.
              </p>
              <button
                type="button"
                onClick={handleGeneratePortfolio}
                disabled={portfolioLoading}
                className="px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#6366f1]/90 disabled:opacity-50"
              >
                {portfolioLoading ? "Generating…" : "Generate portfolio"}
              </button>
            </div>
          )}
        </section>

        {/* Evidence */}
        <section className="mb-8 rounded-xl border border-[#e8e6e3]/20 bg-[#1e1b4b]/30 p-6">
          <h2 className="text-lg font-semibold text-[#22d3ee] mb-3">Evidence (submitted links)</h2>
          {evidence.length > 0 ? (
            <ul className="space-y-3 mb-4 p-3 rounded-lg bg-[#0a0a0f]/50 border border-[#e8e6e3]/10">
              {evidence.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-2 text-sm">
                  {e.title ? (
                    <span className="text-[#e8e6e3]/90 font-medium">{e.title}</span>
                  ) : null}
                  {e.url_or_path ? (
                    <a
                      href={e.url_or_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#22d3ee] hover:underline break-all"
                    >
                      {e.url_or_path}
                    </a>
                  ) : (
                    <span className="text-[#e8e6e3]/60">{e.kind}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#e8e6e3]/60 text-sm mb-4">No links submitted yet. Applicant can add links in the Asteroid Belt stage.</p>
          )}
          <p className="text-[#e8e6e3]/60 text-xs mb-2">Add evidence manually (e.g. link from resume):</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newEvidenceTitle}
              onChange={(e) => setNewEvidenceTitle(e.target.value)}
              placeholder="Title (optional)"
              className="rounded-lg border border-[#e8e6e3]/30 bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e6e3] placeholder:text-[#e8e6e3]/50 w-40"
            />
            <input
              type="url"
              value={newEvidenceUrl}
              onChange={(e) => setNewEvidenceUrl(e.target.value)}
              placeholder="URL"
              className="rounded-lg border border-[#e8e6e3]/30 bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e6e3] placeholder:text-[#e8e6e3]/50 flex-1 min-w-[180px]"
            />
            <button
              type="button"
              onClick={handleAddEvidence}
              disabled={!newEvidenceUrl.trim()}
              className="px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#6366f1]/90 disabled:opacity-50"
            >
              Add evidence
            </button>
          </div>
        </section>

        {/* Score */}
        <section className="mb-8 rounded-xl border border-[#e8e6e3]/20 bg-[#1e1b4b]/30 p-6">
          <h2 className="text-lg font-semibold text-[#22d3ee] mb-3">Rubric score</h2>
          {score ? (
            <div className="space-y-4">
              <div>
                <p className="text-[#e8e6e3]/70 text-sm mb-1">Overall (theoretical)</p>
                <p className="text-3xl font-bold text-[#22c55e]">{score.overall_score ?? "—"}</p>
              </div>
              {score.criteria_scores && score.criteria_scores.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-[#e8e6e3]/10">
                  <p className="text-[#e8e6e3]/70 text-sm mb-2">By criterion</p>
                  {score.criteria_scores.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-[#e8e6e3]/90 w-40 shrink-0">{c.name}</span>
                      <span className="text-[#22d3ee] shrink-0">
                        {c.score} / {c.max}
                      </span>
                      <div className="flex-1 min-w-0 h-2 rounded-full bg-[#e8e6e3]/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6366f1]"
                          style={{ width: `${(100 * c.score) / c.max}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-[#e8e6e3]/60 text-sm mb-3">
                Calculate a rubric score for this application (mock: based on role criteria).
              </p>
              <button
                type="button"
                onClick={handleCalculateScore}
                disabled={scoreLoading}
                className="px-4 py-2 rounded-lg bg-[#22c55e] text-white text-sm font-medium hover:bg-[#22c55e]/90 disabled:opacity-50"
              >
                {scoreLoading ? "Calculating…" : "Calculate score"}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
