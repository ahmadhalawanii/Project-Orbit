type Metrics = {
  total_conversations: number;
  total_portfolios: number;
  total_mission_runs: number;
  avg_score: number;
};

export default function HRKpiPanel({ metrics }: { metrics: Metrics }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-lg font-semibold">HR KPIs</div>
      <div className="mt-3 text-sm text-slate-300">
        Conversations: {metrics.total_conversations}
      </div>
      <div className="text-sm text-slate-300">
        Portfolios: {metrics.total_portfolios}
      </div>
      <div className="text-sm text-slate-300">
        Mission runs: {metrics.total_mission_runs}
      </div>
      <div className="text-sm text-slate-300">
        Avg score: {metrics.avg_score}
      </div>
    </div>
  );
}
