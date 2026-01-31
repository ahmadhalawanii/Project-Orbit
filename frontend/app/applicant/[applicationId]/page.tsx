"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PlanetStepper } from "@/components/space-map/PlanetStepper";
import { StageCard } from "@/components/space-map/StageCard";
import { PlanetScene3DDynamic } from "@/components/space-map/PlanetScene3DWrapper";
import { PlutoStage } from "@/components/applicant/stages/PlutoStage";
import { MercuryStage } from "@/components/applicant/stages/MercuryStage";
import { AsteroidBeltStage } from "@/components/applicant/stages/AsteroidBeltStage";
import { MarsStage } from "@/components/applicant/stages/MarsStage";
import { SaturnStage } from "@/components/applicant/stages/SaturnStage";
import { EarthStage } from "@/components/applicant/stages/EarthStage";
import { getApplication, updateApplication } from "@/lib/api";
import { SPACE_STAGES, getNextStage, getStageById, normalizeStageId } from "@/lib/space-stages";
import { usePlanetTransition } from "@/hooks/usePlanetTransition";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/api";
import type { StageId } from "@/lib/space-stages";

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

export default function ApplicantApplicationPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawStage = app?.current_stage;
  const currentStageId = rawStage ? (normalizeStageId(rawStage) as StageId) : "pluto";
  const currentStageIndex = SPACE_STAGES.findIndex((s) => s.id === currentStageId);
  const safeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  const {
    displayIndex,
    transitionProgress,
    isTransitioning,
    uiVisible,
    startTransition,
  } = usePlanetTransition({ currentStageIndex: safeStageIndex, reducedMotion });

  useEffect(() => {
    getApplication(applicationId)
      .then((data) => {
        setApp(data);
        setError(null);
      })
      .catch(() => setError("Could not load application."))
      .finally(() => setLoading(false));
  }, [applicationId]);

  function handleStageComplete() {
    if (!app) return;
    const currentId = normalizeStageId(app.current_stage) as StageId;
    const next = getNextStage(currentId);
    if (!next) return;
    const nextIndex = SPACE_STAGES.findIndex((s) => s.id === next);
    if (nextIndex < 0) return;
    startTransition(nextIndex, () => {
      updateApplication(applicationId, { current_stage: next })
        .then((updated) => {
          setApp(updated);
          setCardKey((k) => k + 1);
        })
        .catch(() => setError("Failed to save progress."));
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center mission-bg relative">
        <p className="text-[#e8e6e3]/80 relative z-10">Loading your mission…</p>
      </main>
    );
  }

  if (error || !app) {
    return (
      <main className="min-h-screen mission-bg p-6 relative">
        <div className="max-w-2xl mx-auto relative z-10">
          <Link href="/applicant" className="text-[#22d3ee] hover:underline text-sm mb-6 inline-block">
            ← Back to mission select
          </Link>
          <p className="text-[#f97316]">{error || "Application not found."}</p>
        </div>
      </main>
    );
  }

  const completedStageIds = SPACE_STAGES.filter(
    (s) => s.order < (SPACE_STAGES.find((x) => x.id === currentStageId)?.order ?? 0)
  ).map((s) => s.id);
  const stageConfig = getStageById(currentStageId);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D hero POV: only mount on client (avoids SSR/Node loading three.js) */}
      {mounted && (
        <div className="absolute inset-0 z-0">
          <PlanetScene3DDynamic
            currentStageIndex={displayIndex}
            transitionProgress={transitionProgress}
            reducedMotion={reducedMotion}
          />
        </div>
      )}

      {/* Star-streak / warp overlay during fly-through (middle of transition) */}
      {isTransitioning && transitionProgress > 0.2 && transitionProgress < 0.8 && !reducedMotion && (
        <div
          className="fixed inset-0 z-20 pointer-events-none"
          aria-hidden
        >
          <div className="absolute inset-0 animate-warp-streaks opacity-80" />
        </div>
      )}

      {/* "Traveling to X…" during transition */}
      {isTransitioning && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300"
          role="status"
          aria-live="polite"
          aria-label={`Traveling to ${SPACE_STAGES[displayIndex + 1]?.travelLabel ?? ""}`}
        >
          <p className="text-[#e8e6e3]/90 text-lg font-medium bg-[#0a0a0f]/60 px-4 py-2 rounded-lg">
            Traveling to {SPACE_STAGES[displayIndex + 1]?.name ?? "next planet"}…
          </p>
        </div>
      )}

      {/* UI overlay: fades out during transition, fades in after */}
      <div
        className={cn(
          "relative z-10 p-4 sm:p-6 pb-12 min-h-screen transition-opacity duration-500",
          !uiVisible && "opacity-0 pointer-events-none"
        )}
      >
        <div className="max-w-3xl mx-auto">
          <Link href="/applicant" className="text-[#22d3ee] hover:underline text-sm mb-4 inline-block">
            ← Back to mission select
          </Link>
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#e8e6e3]">Your mission</h1>
            <p className="text-[#e8e6e3]/70 text-sm sm:text-base mt-1">
              Progress through the planets. Your place is saved as you go.
            </p>
          </header>

          <PlanetStepper
            currentStageId={currentStageId}
            completedStageIds={completedStageIds}
            transitionFromIndex={null}
            className="mb-6 sm:mb-8"
          />

          {stageConfig && (
            <StageCard
              key={cardKey}
              title={stageConfig.phaseTitle}
              microcopy={stageConfig.microcopy}
              entering
              reducedMotion={reducedMotion}
            >
              {currentStageId === "pluto" && (
                <PlutoStage applicationId={applicationId} onComplete={handleStageComplete} />
              )}
              {currentStageId === "mercury" && (
                <MercuryStage applicationId={applicationId} onComplete={handleStageComplete} />
              )}
              {currentStageId === "asteroid_belt" && (
                <AsteroidBeltStage applicationId={applicationId} onComplete={handleStageComplete} />
              )}
              {currentStageId === "mars" && (
                <MarsStage applicationId={applicationId} onComplete={handleStageComplete} />
              )}
              {currentStageId === "saturn" && (
                <SaturnStage applicationId={applicationId} onComplete={handleStageComplete} />
              )}
              {currentStageId === "earth" && (
                <EarthStage applicationId={applicationId} onComplete={handleStageComplete} />
              )}
            </StageCard>
          )}
        </div>
      </div>
    </main>
  );
}
