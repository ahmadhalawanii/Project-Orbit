"use client";

interface EarthStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function EarthStage({ onComplete }: EarthStageProps) {
  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>
        We&apos;ve built a Candidate Portfolio from your conversation and evidence. Review it,
        then submit when ready.
      </p>
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
