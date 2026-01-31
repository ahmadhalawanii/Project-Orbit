"use client";

import { useState } from "react";

interface PlutoStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function PlutoStage({ onComplete }: PlutoStageProps) {
  const [consent, setConsent] = useState(false);
  const [aiNotice, setAiNotice] = useState(false);

  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>
        Welcome to Orbit. This process is AI-assisted: we use conversation and evidence to build
        your Candidate Portfolio. A human will always review your portfolio before any hiring
        decision.
      </p>
      <div className="rounded-lg border border-[#e8e6e3]/20 bg-[#0a0a0f]/50 p-4 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={aiNotice}
            onChange={(e) => setAiNotice(e.target.checked)}
            className="mt-1 rounded border-[#e8e6e3]/40 focus:ring-[#22d3ee]"
          />
          <span>
            I understand that AI helps extract and structure my answers into a portfolio. I&apos;ve
            read the human-review statement.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 rounded border-[#e8e6e3]/40 focus:ring-[#22d3ee]"
          />
          <span>I consent to data processing for this application.</span>
        </label>
      </div>
      <button
        type="button"
        onClick={onComplete}
        disabled={!consent || !aiNotice}
        className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Continue to Ignition
      </button>
    </div>
  );
}
