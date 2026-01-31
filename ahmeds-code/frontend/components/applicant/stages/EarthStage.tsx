"use client";

import { useState } from "react";
import { generatePortfolio } from "@/lib/api";

interface EarthStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function EarthStage({ applicationId, onComplete }: EarthStageProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const portfolio = await generatePortfolio(applicationId);
      setSummary(portfolio.summary || "Portfolio generated.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>
        We&apos;ve built a Candidate Portfolio from your conversation and evidence. Generate it,
        review it, then submit when ready.
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 rounded-lg border border-[#e8e6e3]/40 text-[#e8e6e3] font-medium hover:bg-[#e8e6e3]/10 transition disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate portfolio"}
      </button>
      {summary && <div className="rounded-lg bg-[#0a0a0f]/50 p-3 text-sm">{summary}</div>}
      <button
        type="button"
        onClick={onComplete}
        className="px-6 py-3 rounded-lg bg-[#22c55e] text-white font-medium hover:bg-[#22c55e]/90 transition"
      >
        Submit application
      </button>
    </div>
  );
}
