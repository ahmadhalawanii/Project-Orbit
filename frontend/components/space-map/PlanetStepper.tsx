"use client";

import { useEffect, useState } from "react";
import { SPACE_STAGES } from "@/lib/space-stages";
import { cn } from "@/lib/utils";

export type PlanetState = "locked" | "active" | "completed";

interface PlanetStepperProps {
  currentStageId: string;
  completedStageIds: string[];
  /** When set, show travel animation from this index to current (e.g. after completing a stage). */
  transitionFromIndex?: number | null;
  className?: string;
}

const PLANET_COLORS: Record<string, string> = {
  pluto: "from-slate-500 to-slate-700",
  mercury: "from-amber-600/90 to-amber-800",
  asteroid_belt: "from-stone-400 to-stone-600",
  mars: "from-orange-500 to-red-700",
  saturn: "from-amber-200/80 to-yellow-600",
  earth: "from-cyan-400 to-blue-600",
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function PlanetStepper({
  currentStageId,
  completedStageIds,
  transitionFromIndex = null,
  className,
}: PlanetStepperProps) {
  const reducedMotion = useReducedMotion();
  const currentIndex = SPACE_STAGES.findIndex((s) => s.id === currentStageId);

  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-1 sm:gap-2", className)}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={SPACE_STAGES.length}
      aria-label="Mission progress"
    >
      {SPACE_STAGES.map((stage, i) => {
        const isCompleted = completedStageIds.includes(stage.id);
        const isActive = currentStageId === stage.id;
        const isLocked = !isCompleted && !isActive;
        const state: PlanetState = isLocked ? "locked" : isActive ? "active" : "completed";

        const showTravelLine =
          !reducedMotion &&
          transitionFromIndex !== null &&
          i === transitionFromIndex &&
          currentIndex === transitionFromIndex + 1;

        return (
          <div key={stage.id} className="flex items-center">
            {/* Planet chip */}
            <div
              className={cn(
                "flex flex-col items-center rounded-2xl px-2 sm:px-3 py-2 min-w-[64px] sm:min-w-[72px] transition-all duration-300",
                isActive &&
                  !reducedMotion &&
                  "ring-2 ring-[#22d3ee] ring-offset-2 ring-offset-[#0f172a] animate-orbit-ring",
                isActive && reducedMotion && "ring-2 ring-[#22d3ee] ring-offset-2 ring-offset-[#0f172a]",
                isCompleted && transitionFromIndex === i && !reducedMotion && "animate-pulse-once",
                isLocked && "opacity-50"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Circle planet icon */}
              <div
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 border border-white/10 shadow-lg",
                  PLANET_COLORS[stage.id] ?? "from-slate-500 to-slate-700",
                  isActive && "shadow-[0_0_20px_rgba(34,211,238,0.4)]",
                  isCompleted && "shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isLocked ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : null}
              </div>
              <span
                className={cn(
                  "text-xs sm:text-sm font-semibold mt-1.5 truncate max-w-[72px]",
                  isActive ? "text-[#22d3ee]" : isCompleted ? "text-emerald-400/90" : "text-[#e8e6e3]/60"
                )}
              >
                {stage.name}
              </span>
              <span className="text-[10px] sm:text-xs text-[#e8e6e3]/50 truncate max-w-[72px]">
                {stage.short}
              </span>
            </div>

            {/* Connector: static line or travel animation */}
            {i < SPACE_STAGES.length - 1 && (
              <div className="w-3 sm:w-6 h-0.5 mx-0.5 sm:mx-1 flex items-center overflow-hidden" aria-hidden>
                {!reducedMotion && showTravelLine ? (
                  <div className="h-full w-full bg-gradient-to-r from-[#22c55e] via-[#22d3ee] to-transparent animate-travel-line rounded-full" />
                ) : (
                  <div
                    className={cn(
                      "h-full w-full rounded-full transition-colors duration-300",
                      isCompleted ? "bg-[#22c55e]/60" : "bg-[#e8e6e3]/20"
                    )}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
