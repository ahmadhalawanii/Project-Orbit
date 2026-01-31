"use client";

import { useState, useEffect } from "react";
import { listEvidence, addEvidence } from "@/lib/api";
import type { Evidence } from "@/lib/api";

interface AsteroidBeltStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function AsteroidBeltStage({ applicationId, onComplete }: AsteroidBeltStageProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEvidence(applicationId)
      .then(setEvidence)
      .catch(() => setEvidence([]));
  }, [applicationId]);

  async function handleAdd() {
    const u = url.trim();
    if (!u) return;
    setError(null);
    setAdding(true);
    try {
      const e = await addEvidence(applicationId, {
        kind: "link",
        title: title.trim() || undefined,
        url_or_path: u,
      });
      setEvidence((prev) => [e, ...prev]);
      setTitle("");
      setUrl("");
    } catch {
      setError("Failed to add link. Try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6 text-[#e8e6e3]/90">
      <p>
        Add evidence: GitHub, Drive, Behance, Notion, or any link. Your links are saved and
        recruiters will see them in your portfolio.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="rounded-lg border border-[#e8e6e3]/30 bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e6e3] placeholder:text-[#e8e6e3]/50 w-36"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-lg border border-[#e8e6e3]/30 bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e6e3] placeholder:text-[#e8e6e3]/50 flex-1 min-w-[180px]"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!url.trim() || adding}
          className="px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#6366f1]/90 disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add link"}
        </button>
      </div>
      {error && <p className="text-[#f97316] text-sm">{error}</p>}
      {evidence.length > 0 && (
        <div className="rounded-lg border border-[#e8e6e3]/20 bg-[#0a0a0f]/50 p-4">
          <p className="text-sm font-medium text-[#e8e6e3]/80 mb-2">Submitted links ({evidence.length})</p>
          <ul className="space-y-1 text-sm">
            {evidence.map((e) => (
              <li key={e.id}>
                {e.title ? (
                  <span className="text-[#e8e6e3]/90">{e.title}: </span>
                ) : null}
                <a
                  href={e.url_or_path ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#22d3ee] hover:underline break-all"
                >
                  {e.url_or_path}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={onComplete}
        className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
      >
        Continue to The Trial
      </button>
    </div>
  );
}
