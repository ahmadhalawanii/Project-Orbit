"use client";

import { PlanetCard } from "@/components/space-map/PlanetCard";

interface DockingStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function DockingStage({ onComplete }: DockingStageProps) {
  return (
    <PlanetCard
      title="Docking Station — Collaboration"
      subtitle="Async task with artifacts"
      badge="Stage 5"
    >
      <div className="space-y-6 text-[#e8e6e3]/90">
        <p>Here you&apos;d complete an async collaboration exercise. For this restore we skip it.</p>
        <button
          type="button"
          onClick={onComplete}
          className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
        >
          Continue to Mission Control
        </button>
      </div>
    </PlanetCard>
  );
}
