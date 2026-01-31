"use client";

import { useState } from "react";
import { apiPost } from "../lib/api";
import SourcesDrawer from "./SourcesDrawer";

type Citation = {
  doc_id: string;
  title: string;
  chunk_id: string;
  snippet: string;
};

type ChatResponse = {
  answer: string;
  citations: Citation[];
  followups: string[];
};

export default function ChatPanel({ mode }: { mode: string }) {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const data = await apiPost<ChatResponse>("/chat", {
        user_id: "u1",
        conversation_id: "c1",
        mode,
        message
      });
      setAnswer(data.answer);
      setCitations(data.citations || []);
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-sm text-slate-400">Mode: {mode}</div>
      <textarea
        className="mt-3 w-full rounded bg-slate-950 p-3 text-slate-100"
        rows={4}
        placeholder="Ask about roles, policies, onboarding..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        className="mt-3 rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        onClick={sendMessage}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send"}
      </button>
      {answer ? (
        <div className="mt-6 space-y-3">
          <div className="rounded bg-slate-950 p-3 text-slate-100">
            {answer}
          </div>
          <SourcesDrawer citations={citations} />
        </div>
      ) : null}
    </div>
  );
}
