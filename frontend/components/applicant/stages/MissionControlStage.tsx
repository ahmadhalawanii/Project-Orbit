"use client";

import { PlanetCard } from "@/components/space-map/PlanetCard";

interface MissionControlStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function MissionControlStage({ onComplete }: MissionControlStageProps) {
  return (
    <PlanetCard
      title="Mission Control — Review & submit"
      subtitle="Review your portfolio and submit when ready"
      badge="Stage 6"
    >
      <div className="space-y-6 text-[#e8e6e3]/90">
        <p>
          We&apos;ve built a Candidate Portfolio from your conversation and evidence. Generate it
          (when backend portfolio API is restored), then submit.
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="px-6 py-3 rounded-lg bg-[#22c55e] text-white font-medium hover:bg-[#22c55e]/90 transition"
        >
          Submit application
        </button>
      </div>
    </PlanetCard>
  );
}
