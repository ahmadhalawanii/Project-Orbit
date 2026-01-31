"use client";

import { PlanetCard } from "@/components/space-map/PlanetCard";

interface SpacewalkStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function SpacewalkStage({ onComplete }: SpacewalkStageProps) {
  return (
    <PlanetCard
      title="Spacewalk — Skills demonstration"
      subtitle="Lightweight challenges from your Mission Pack"
      badge="Stage 4"
    >
      <div className="space-y-6 text-[#e8e6e3]/90">
        <p>
          In a full rollout you&apos;d see 2–4 micro-challenges here. For this restore, we skip live
          challenges.
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
        >
          Continue to Docking Station
        </button>
      </div>
    </PlanetCard>
  );
}
