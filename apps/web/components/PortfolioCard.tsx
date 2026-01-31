type Portfolio = {
  summary?: string;
  target_roles: string[];
  preferences: Record<string, string>;
  claims: Array<{ claim: string }>;
  competencies: Array<{ dimension: string; note: string }>;
  flags: Array<{ type: string; note: string }>;
};

export default function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-lg font-semibold">Living Portfolio</div>
      <div className="mt-3 text-slate-300">{portfolio.summary || "No summary yet."}</div>
      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-200">Target Roles</div>
        <div className="text-sm text-slate-400">
          {portfolio.target_roles.length
            ? portfolio.target_roles.join(", ")
            : "Not set"}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-200">Claims</div>
        <div className="text-sm text-slate-400">
          {portfolio.claims.length
            ? portfolio.claims.map((c) => c.claim).join(" • ")
            : "No claims yet"}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-200">Competencies</div>
        <div className="text-sm text-slate-400">
          {portfolio.competencies.length
            ? portfolio.competencies.map((c) => `${c.dimension}: ${c.note}`).join(" • ")
            : "No competencies yet"}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-200">Flags</div>
        <div className="text-sm text-slate-400">
          {portfolio.flags.length
            ? portfolio.flags.map((f) => `${f.type}: ${f.note}`).join(" • ")
            : "No flags yet"}
        </div>
      </div>
    </div>
  );
}
