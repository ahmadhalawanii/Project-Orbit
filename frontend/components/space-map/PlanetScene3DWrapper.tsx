"use client";

import dynamic from "next/dynamic";

/** Props for 3D scene - defined here so server never imports PlanetScene3D (three.js/R3F). */
export interface PlanetScene3DProps {
  currentStageIndex: number;
  transitionProgress: number;
  reducedMotion: boolean;
  className?: string;
}

export const PlanetScene3DDynamic = dynamic<PlanetScene3DProps>(
  () => import("./PlanetScene3D").then((mod) => ({ default: mod.PlanetScene3D })),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#0a0a0f]" /> }
);
