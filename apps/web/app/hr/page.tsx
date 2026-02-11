"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import HRKpiPanel from "../../components/HRKpiPanel";

type Metrics = {
  total_conversations: number;
  total_portfolios: number;
  total_mission_runs: number;
  avg_score: number;
};

export default function HRPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    apiGet<Metrics>("/metrics/hr").then(setMetrics).catch(() => {
      setMetrics({
        total_conversations: 0,
        total_portfolios: 0,
        total_mission_runs: 0,
        avg_score: 0
      });
    });
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">HR Console</h1>
      <p className="mt-2 text-slate-300">
        KPI overview for candidate flow.
      </p>
      <div className="mt-6">
        {metrics ? <HRKpiPanel metrics={metrics} /> : "Loading..."}
      </div>
    </main>
  );
}
