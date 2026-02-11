"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const TRANSITION_DURATION_MS = 3200;
/** Fire onComplete and show UI at this progress so stage update feels seamless (no pop at 100%). */
const EARLY_COMPLETE_AT = 0.88;

export interface UsePlanetTransitionOptions {
  currentStageIndex: number;
  reducedMotion?: boolean;
}

export interface UsePlanetTransitionReturn {
  /** Index to use for 3D scene (current planet). During transition = fromIndex. */
  displayIndex: number;
  /** Target index during transition (for forward or backward); when idle same as current. */
  toStageIndex: number;
  /** 0..1, drives camera dolly + arc */
  transitionProgress: number;
  isTransitioning: boolean;
  /** False while transitioning (fade UI out), true when idle (show UI) */
  uiVisible: boolean;
  /** Call to animate from fromIndex to toIndex, then onComplete. Pass fromIndex so the animation always starts from the planet we're viewing. */
  startTransition: (fromIndex: number, toIndex: number, onComplete: () => void) => void;
}

export function usePlanetTransition({
  currentStageIndex,
  reducedMotion = false,
}: UsePlanetTransitionOptions): UsePlanetTransitionReturn {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(0);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const earlyCompleteFiredRef = useRef(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const runIdRef = useRef(0);
  const lockedRef = useRef(false);

  const duration = reducedMotion ? 400 : TRANSITION_DURATION_MS;

  useEffect(() => {
    if (!isTransitioning) return;

    const start = startTimeRef.current;
    const runId = ++runIdRef.current;

    const tick = (now: number) => {
      if (runId !== runIdRef.current) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setTransitionProgress(progress);

      if (progress >= EARLY_COMPLETE_AT && !earlyCompleteFiredRef.current && !reducedMotion) {
        earlyCompleteFiredRef.current = true;
        onCompleteRef.current?.();
        onCompleteRef.current = null;
      }
      if (progress >= 1) {
        earlyCompleteFiredRef.current = false;
        lockedRef.current = false;
        setIsTransitioning(false);
        setTransitionProgress(0);
        if (reducedMotion) {
          onCompleteRef.current?.();
          onCompleteRef.current = null;
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      runIdRef.current = 0;
      lockedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTransitioning, duration, reducedMotion]);

  const startTransition = useCallback(
    (from: number, to: number, onComplete: () => void) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setFromIndex(from);
      setToIndex(to);
      onCompleteRef.current = onComplete;
      earlyCompleteFiredRef.current = false;
      startTimeRef.current = performance.now();
      setIsTransitioning(true);
      setTransitionProgress(0);
    },
    []
  );

  const displayIndex = isTransitioning ? fromIndex : currentStageIndex;
  const toStageIndex = isTransitioning ? toIndex : currentStageIndex;
  const uiVisible = !isTransitioning || transitionProgress >= EARLY_COMPLETE_AT;

  return {
    displayIndex,
    toStageIndex,
    transitionProgress,
    isTransitioning,
    uiVisible,
    startTransition,
  };
}
