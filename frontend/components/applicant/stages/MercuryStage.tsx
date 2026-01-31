"use client";

import { useState } from "react";

const PROMPTS: Record<number, string> = {
  0: "Tell me your story in a few sentences — what brought you here and what role you're aiming for?",
  1: "What's your strongest experience or achievement that relates to this role?",
  2: "Thanks. We've captured that. Head to the Evidence Field to add links when you're ready.",
};

interface MercuryStageProps {
  applicationId: string;
  onComplete: () => void;
}

export function MercuryStage({ onComplete }: MercuryStageProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const nextPrompt = PROMPTS[Math.min(step + 1, 2)];
    setMessages((prev) => [...prev, { role: "assistant", content: nextPrompt }]);
    setStep((s) => Math.min(s + 1, 2));
  }

  const canComplete = step >= 1 && messages.some((m) => m.role === "user");

  return (
    <div className="space-y-4">
      <div className="min-h-[200px] max-h-[320px] overflow-y-auto space-y-3 rounded-lg border border-[#e8e6e3]/20 bg-[#0a0a0f]/50 p-4">
        {messages.length === 0 && <p className="text-[#e8e6e3]/70">{PROMPTS[0]}</p>}
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
          disabled={!input.trim()}
          className="px-4 py-2 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 disabled:opacity-50 transition"
        >
          Send
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
