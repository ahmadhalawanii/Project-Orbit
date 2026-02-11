"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import MissionPackViewer from "../../../components/MissionPackViewer";
import RubricScoreBreakdown from "../../../components/RubricScoreBreakdown";

type MissionPack = {
  id: number;
  job_family: string;
  brief_md: string;
  deliverables: string[];
};

type MissionRunResponse = { run_id: number };

type Score = {
  total_0_10: number;
  subscores: Record<string, number | string>;
  evidence_anchors: Record<string, string>;
  uncertainty_notes?: string;
};

export default function MissionPackPage({
  params
}: {
  params: { job_family: string };
}) {
  const [pack, setPack] = useState<MissionPack | null>(null);
  const [runId, setRunId] = useState<number | null>(null);
  const [artifactUrl, setArtifactUrl] = useState("");
  const [reflection, setReflection] = useState("");
  const [score, setScore] = useState<Score | null>(null);

  useEffect(() => {
    apiGet<MissionPack>(`/mission/packs/${params.job_family}`)
      .then(setPack)
      .catch(() => setPack(null));
  }, [params.job_family]);

  async function startRun() {
    if (runId) return runId;
    const run = await apiPost<MissionRunResponse>("/mission/run/start", {
      user_id: "u1",
      job_family: params.job_family
    });
    setRunId(run.run_id);
    return run.run_id;
  }

  async function submitForScore() {
    const id = await startRun();
    const result = await apiPost<Score>(`/mission/run/${id}/score`, {
      artifacts: [{ type: "github", url: artifactUrl }],
      reflection
    });
    setScore(result);
  }

  if (!pack) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <MissionPackViewer pack={pack} />
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm text-slate-200">Submit artifacts</div>
        <input
          className="mt-3 w-full rounded bg-slate-950 p-2 text-slate-100"
          placeholder="GitHub repo or PR link"
          value={artifactUrl}
          onChange={(event) => setArtifactUrl(event.target.value)}
        />
        <textarea
          className="mt-3 w-full rounded bg-slate-950 p-2 text-slate-100"
          rows={3}
          placeholder="Reflection"
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
        />
        <button
          className="mt-3 rounded bg-blue-500 px-4 py-2 text-white"
          onClick={submitForScore}
        >
          Score mission
        </button>
      </div>
      {score ? <RubricScoreBreakdown score={score} /> : null}
    </main>
  );
}
