"use client";

import { useState } from "react";
import { SaturnVoiceInterview } from "@/components/applicant/stages/SaturnVoiceInterview";

interface SaturnStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function SaturnStage({ applicationId, onComplete }: SaturnStageProps) {
  const [ended, setEnded] = useState(false);

  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>
        Crew Ring is a voice interview. The AI interviewer will ask role-relevant questions and
        respond by voice. No text chat is shown here.
      </p>
      <SaturnVoiceInterview
        applicationId={applicationId}
        onEnded={() => setEnded(true)}
      />
      {ended && (
        <button
          type="button"
          onClick={onComplete}
          className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
        >
          Continue to Landing
        </button>
      )}
    </div>
  );
}
