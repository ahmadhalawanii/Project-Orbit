"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const TRANSITION_DURATION_MS = 3200;
const STAGE_REVEAL_AT = 0.55;

export interface UsePlanetTransitionOptions {
  currentStageIndex: number;
  reducedMotion?: boolean;
}

export interface UsePlanetTransitionReturn {
  /** Index to use for 3D scene (current planet at 0, next at -D). During transition = fromIndex. */
  displayIndex: number;
  /** 0..1, drives camera dolly + arc */
  transitionProgress: number;
  isTransitioning: boolean;
  /** False while transitioning (fade UI out), true when idle (show UI) */
  uiVisible: boolean;
  /** Call when user clicks Continue. Animates camera, then calls onComplete. */
  startTransition: (toIndex: number, onComplete: () => void) => void;
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
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const duration = reducedMotion ? 400 : TRANSITION_DURATION_MS;

  useEffect(() => {
    if (!isTransitioning) return;
    if (reducedMotion) return;

    const start = startTimeRef.current;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setTransitionProgress(progress);

      if (progress >= 1) {
        onCompleteRef.current?.();
        onCompleteRef.current = null;
        setIsTransitioning(false);
        setTransitionProgress(0);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isTransitioning, duration, reducedMotion]);

  const startTransition = useCallback(
    (nextIndex: number, onComplete: () => void) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setFromIndex(currentStageIndex);
      setToIndex(nextIndex);
      if (reducedMotion) {
        setIsTransitioning(true);
        setTransitionProgress(0);
        timeoutRef.current = setTimeout(() => {
          onComplete();
          setIsTransitioning(false);
          timeoutRef.current = null;
        }, 400);
        return;
      }
      onCompleteRef.current = onComplete;
      startTimeRef.current = performance.now();
      setIsTransitioning(true);
      setTransitionProgress(0);
    },
    [currentStageIndex, reducedMotion]
  );

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);
  const displayIndex = isTransitioning ? fromIndex : currentStageIndex;
  const uiVisible = !isTransitioning;

  return {
    displayIndex,
    transitionProgress,
    isTransitioning,
    uiVisible,
    startTransition,
  };
}
