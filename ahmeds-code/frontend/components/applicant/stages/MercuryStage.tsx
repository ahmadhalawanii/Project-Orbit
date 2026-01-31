"use client";

import { useState } from "react";
import { chatApplication } from "@/lib/api";

const PROMPT =
  "Tell me your story in a few sentences — what brought you here and what role you're aiming for?";

interface MercuryStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function MercuryStage({ applicationId, onComplete }: MercuryStageProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    try {
      const response = await chatApplication(applicationId, text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer || "Captured." },
      ]);
    } catch {
      setError("Could not reach the AI agent. Try again.");
    } finally {
      setSending(false);
    }
  }

  const canComplete = messages.some((m) => m.role === "user");

  return (
    <div className="space-y-4">
      <div className="min-h-[200px] max-h-[320px] overflow-y-auto space-y-3 rounded-lg border border-[#e8e6e3]/20 bg-[#0a0a0f]/50 p-4">
        {messages.length === 0 && <p className="text-[#e8e6e3]/70">{PROMPT}</p>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                m.role === "user"
                  ? "inline-block rounded-lg bg-[#6366f1]/30 px-3 py-2 text-sm"
                  : "inline-block rounded-lg bg-[#e8e6e3]/10 px-3 py-2 text-sm"
              }
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      {error && <p className="text-[#f97316] text-sm">{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your reply…"
          className="flex-1 rounded-lg border border-[#e8e6e3]/30 bg-[#0a0a0f] px-4 py-2 text-[#e8e6e3] placeholder:text-[#e8e6e3]/50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || sending}
          className="px-4 py-2 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 disabled:opacity-50 transition"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
      {canComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 px-6 py-3 rounded-lg border border-[#e8e6e3]/40 text-[#e8e6e3] font-medium hover:bg-[#e8e6e3]/10 transition"
        >
          Continue to Evidence Field
        </button>
      )}
    </div>
  );
}
