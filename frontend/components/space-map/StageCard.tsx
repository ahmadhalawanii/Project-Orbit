"use client";

import { cn } from "@/lib/utils";

interface StageCardProps {
  /** e.g. "Pluto — The Gate" */
  title: string;
  /** One line microcopy for the phase */
  microcopy: string;
  children: React.ReactNode;
  className?: string;
  /** When true, content is entering (slide/fade in) */
  entering?: boolean;
  /** When true, content is exiting (slide/fade out) */
  exiting?: boolean;
  /** Prefer reduced motion: skip slide, use fade only */
  reducedMotion?: boolean;
}

export function StageCard({
  title,
  microcopy,
  children,
  className,
  entering = false,
  exiting = false,
  reducedMotion = false,
}: StageCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#e8e6e3]/15 bg-[#0f172a]/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl transition-all duration-300",
        !reducedMotion && entering && "animate-stage-enter",
        !reducedMotion && exiting && "animate-stage-exit",
        reducedMotion && (entering || exiting) && "animate-fade-only",
        className
      )}
      aria-labelledby="stage-card-title"
    >
      <div className="mb-6">
        <h2 id="stage-card-title" className="text-xl sm:text-2xl font-bold text-[#e8e6e3]">
          {title}
        </h2>
        <p className="text-sm text-[#e8e6e3]/70 mt-1">{microcopy}</p>
      </div>
      <div className="text-[#e8e6e3]/90">{children}</div>
    </section>
  );
}
