"use client";

type Citation = {
  doc_id: string;
  title: string;
  chunk_id: string;
  snippet: string;
};

export default function SourcesDrawer({ citations }: { citations: Citation[] }) {
  if (!citations.length) {
    return (
      <div className="rounded bg-slate-950 p-3 text-sm text-slate-400">
        No sources returned.
      </div>
    );
  }
  return (
    <div className="rounded bg-slate-950 p-3">
      <div className="text-sm font-semibold text-slate-200">Sources</div>
      <div className="mt-2 space-y-2">
        {citations.map((citation) => (
          <div key={citation.chunk_id} className="text-xs text-slate-300">
            <div className="font-medium">{citation.title}</div>
            <div className="text-slate-400">{citation.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
