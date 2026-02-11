type Score = {
  total_0_10: number;
  subscores: Record<string, number | string>;
  evidence_anchors: Record<string, string>;
  uncertainty_notes?: string;
};

export default function RubricScoreBreakdown({ score }: { score: Score }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-lg font-semibold">Score: {score.total_0_10}</div>
      <div className="mt-3 text-sm text-slate-400">
        {score.uncertainty_notes}
      </div>
      <div className="mt-4 text-sm text-slate-300">
        {Object.entries(score.subscores).map(([key, value]) => (
          <div key={key}>
            {key}: {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
}
