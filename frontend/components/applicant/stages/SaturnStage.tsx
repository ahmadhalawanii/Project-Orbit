"use client";

interface SaturnStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function SaturnStage({ onComplete }: SaturnStageProps) {
  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>Here you&apos;d complete an async collaboration exercise. For now we skip it.</p>
      <button
        type="button"
        onClick={onComplete}
        className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
      >
        Continue to Landing
      </button>
    </div>
  );
}
