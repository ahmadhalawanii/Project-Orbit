"use client";

import { useEffect, useState } from "react";
import { PlanetScene } from "./PlanetScene";
import { getStageById } from "@/lib/space-stages";
import type { StageId } from "@/lib/space-stages";
import { cn } from "@/lib/utils";

type Phase =
  | "current-big"
  | "zoom-warp"
  | "next-big"
  | "settle"
  | "done";

interface TransitionControllerProps {
  fromStageId: StageId;
  toStageId: StageId;
  onComplete: () => void;
  reducedMotion?: boolean;
}

const DURATION = {
  currentBig: 600,
  zoomWarp: 900,
  nextBig: 500,
  settle: 500,
  fadeOut: 400,
};

const DURATION_REDUCED = {
  show: 300,
  fade: 400,
};

export function TransitionController({
  fromStageId,
  toStageId,
  onComplete,
  reducedMotion = false,
}: TransitionControllerProps) {
  const [phase, setPhase] = useState<Phase>("current-big");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const toStage = getStageById(toStageId);
  const travelLabel = toStage?.travelLabel ?? toStage?.name ?? toStageId;

  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(() => {
        setOverlayVisible(false);
        const t2 = setTimeout(onComplete, DURATION_REDUCED.fade);
        return () => clearTimeout(t2);
      }, DURATION_REDUCED.show);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase("zoom-warp"), DURATION.currentBig);
    const t2 = setTimeout(() => setPhase("next-big"), DURATION.currentBig + DURATION.zoomWarp);
    const t3 = setTimeout(() => setPhase("settle"), DURATION.currentBig + DURATION.zoomWarp + DURATION.nextBig);
    const t4 = setTimeout(() => setOverlayVisible(false), DURATION.currentBig + DURATION.zoomWarp + DURATION.nextBig + DURATION.settle);
    const t5 = setTimeout(onComplete, DURATION.currentBig + DURATION.zoomWarp + DURATION.nextBig + DURATION.settle + DURATION.fadeOut);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [fromStageId, toStageId, onComplete, reducedMotion]);

  if (!overlayVisible) return null;

  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/95 transition-opacity duration-300"
        role="status"
        aria-live="polite"
        aria-label={`Traveling to ${travelLabel}`}
      >
        <p className="text-[#e8e6e3]/90 text-lg font-medium">
          Traveling to {travelLabel}…
        </p>
      </div>
    );
  }

  const showFrom = phase === "current-big" || phase === "zoom-warp";
  const showWarp = phase === "zoom-warp" || phase === "next-big";
  const showTo = phase === "next-big" || phase === "settle";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#0f172a] transition-opacity duration-300",
        !overlayVisible && "opacity-0"
      )}
      role="status"
      aria-live="polite"
      aria-label={`Traveling to ${travelLabel}`}
    >
      {/* Star streaks / warp effect */}
      {showWarp && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden
        >
          <div className="absolute inset-0 animate-warp-streaks" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,transparent_40%,#0a0a0f_100%)]" />
        </div>
      )}

      {/* Current planet (big) - zoom in then fade into warp */}
      {showFrom && (
        <div
          className={cn(
            "absolute flex items-center justify-center transition-all duration-700 ease-out",
            phase === "zoom-warp" ? "scale-[2.2] opacity-0" : "scale-100 opacity-100"
          )}
        >
          <PlanetScene stageId={fromStageId} size="hero" />
        </div>
      )}

      {/* Next planet (big) - appears then settles */}
      {showTo && (
        <div
          className={cn(
            "absolute flex items-center justify-center transition-all duration-500",
            phase === "next-big" ? "scale-110 opacity-100" : "scale-100 opacity-100"
          )}
        >
          <PlanetScene
            stageId={toStageId}
            size={phase === "settle" ? "landed" : "hero"}
          />
        </div>
      )}

      {/* "Traveling to X…" label */}
      <p
        className={cn(
          "relative z-10 mt-8 text-[#e8e6e3]/90 text-lg sm:text-xl font-medium transition-opacity duration-300",
          showTo ? "opacity-100" : "opacity-0"
        )}
      >
        Traveling to {travelLabel}…
      </p>
    </div>
  );
}
