"use client";

import { cn } from "@/lib/utils";

interface PlanetCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
}

export function PlanetCard({ title, subtitle, children, className, badge }: PlanetCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#e8e6e3]/20 bg-[#1e1b4b]/50 p-6 shadow-xl",
        className
      )}
      aria-labelledby="planet-title"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 id="planet-title" className="text-xl font-bold text-[#e8e6e3]">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-[#e8e6e3]/70 mt-1">{subtitle}</p>}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-[#6366f1]/30 px-3 py-1 text-xs font-medium text-[#22d3ee]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
