"use client";

interface MarsStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function MarsStage({ onComplete }: MarsStageProps) {
  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>
        In a full rollout you&apos;d see 2–4 micro-challenges here. For now we skip live challenges.
      </p>
      <button
        type="button"
        onClick={onComplete}
        className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
      >
        Continue to Crew Ring
      </button>
    </div>
  );
}
