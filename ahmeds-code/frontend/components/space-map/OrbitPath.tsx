"use client";

import { SPACE_STAGES } from "@/lib/space-stages";
import { cn } from "@/lib/utils";

interface OrbitPathProps {
  currentStageId: string;
  completedStages: string[];
  className?: string;
}

export function OrbitPath({ currentStageId, completedStages, className }: OrbitPathProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2 md:gap-4", className)}>
      {SPACE_STAGES.map((stage, i) => {
        const isCompleted = completedStages.includes(stage.id);
        const isCurrent = currentStageId === stage.id;
        return (
          <div key={stage.id} className="flex items-center">
            <span
              className={cn(
                "flex flex-col items-center rounded-xl px-3 py-2 min-w-[80px] transition",
                isCurrent && "bg-[#6366f1]/20 ring-2 ring-[#6366f1]",
                isCompleted && !isCurrent && "opacity-80",
                !isCompleted && !isCurrent && "opacity-60"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "text-lg font-bold",
                  isCurrent ? "text-[#22d3ee]" : isCompleted ? "text-[#22c55e]" : "text-[#e8e6e3]/70"
                )}
              >
                {stage.name}
              </span>
              <span className="text-xs text-[#e8e6e3]/60 mt-0.5">{stage.short}</span>
            </span>
            {i < SPACE_STAGES.length - 1 && (
              <div className="hidden sm:block w-4 h-0.5 bg-[#e8e6e3]/30 mx-1" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
