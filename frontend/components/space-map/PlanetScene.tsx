"use client";

import { cn } from "@/lib/utils";
import type { StageId } from "@/lib/space-stages";

interface PlanetSceneProps {
  stageId: StageId;
  /** "hero" = large for full-screen transition; "landed" = slightly smaller after settle */
  size?: "hero" | "landed";
  className?: string;
}

const PLANET_STYLES: Record<
  StageId,
  { gradient: string; shadow: string; ring?: boolean; particles?: boolean }
> = {
  pluto: {
    gradient: "from-slate-300 via-slate-500 to-slate-800",
    shadow: "shadow-[0_0_80px_rgba(148,163,184,0.3)]",
  },
  mercury: {
    gradient: "from-amber-200 via-amber-500 to-amber-900",
    shadow: "shadow-[0_0_80px_rgba(245,158,11,0.4)]",
  },
  asteroid_belt: {
    gradient: "from-stone-400 via-stone-600 to-stone-800",
    shadow: "shadow-[0_0_60px_rgba(120,113,108,0.35)]",
    particles: true,
  },
  mars: {
    gradient: "from-red-400/90 via-red-700 to-red-950",
    shadow: "shadow-[0_0_80px_rgba(185,28,28,0.35)]",
  },
  saturn: {
    gradient: "from-amber-100/90 via-amber-400 to-amber-700",
    shadow: "shadow-[0_0_80px_rgba(245,158,11,0.25)]",
    ring: true,
  },
  earth: {
    gradient: "from-cyan-300 via-blue-500 to-emerald-800",
    shadow: "shadow-[0_0_80px_rgba(34,211,238,0.25)]",
  },
};

export function PlanetScene({ stageId, size = "hero", className }: PlanetSceneProps) {
  const style = PLANET_STYLES[stageId] ?? PLANET_STYLES.pluto;
  const isHero = size === "hero";
  const dimension = isHero ? "min(85vmin, 420px)" : "min(75vmin, 360px)";

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      aria-hidden
    >
      {/* Planet sphere */}
      <div
        className={cn(
          "rounded-full bg-gradient-to-br flex-shrink-0 transition-all duration-500",
          style.gradient,
          style.shadow,
          isHero && "border border-white/10"
        )}
        style={{
          width: dimension,
          height: dimension,
          boxShadow: style.shadow ? undefined : "0 0 60px rgba(0,0,0,0.3)",
        }}
      />

      {/* Saturn ring: elliptical ring around planet */}
      {style.ring && stageId === "saturn" && (
        <div
          className="absolute rounded-full border-2 border-amber-200/50 border-transparent"
          style={{
            width: "140%",
            height: "45%",
            top: "27%",
            left: "-20%",
            borderTopColor: "rgba(253,230,138,0.5)",
            borderBottomColor: "rgba(253,230,138,0.15)",
          }}
        />
      )}

      {/* Asteroid belt: particle field hint */}
      {style.particles && stageId === "asteroid_belt" && (
        <div
          className="absolute inset-0 rounded-full overflow-visible pointer-events-none"
          style={{ width: dimension, height: dimension }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-stone-500/60"
              style={{
                width: 4 + (i % 3) * 2,
                height: 4 + (i % 3) * 2,
                left: `${50 + Math.cos((i / 12) * Math.PI * 2) * 55}%`,
                top: `${50 + Math.sin((i / 12) * Math.PI * 2) * 55}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
