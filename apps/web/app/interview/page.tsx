"use client";

import { useState } from "react";
import { apiPost } from "../../lib/api";

type StartResponse = {
  interview_id: number;
  next_question: string;
};

type AnswerResponse = {
  next_question?: string;
  done: boolean;
};

type FinalizeResponse = {
  decision_pack: Record<string, string | string[]>;
};

export default function InterviewPage() {
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [decision, setDecision] = useState<FinalizeResponse | null>(null);

  async function startInterview() {
    const data = await apiPost<StartResponse>("/interview/start", {
      user_id: "u1",
      job_family: "engineering"
    });
    setInterviewId(data.interview_id);
    setQuestion(data.next_question);
  }

  async function submitAnswer() {
    if (!interviewId) return;
    const data = await apiPost<AnswerResponse>(
      `/interview/${interviewId}/answer`,
      { answer }
    );
    setAnswer("");
    if (data.done) {
      const final = await apiPost<FinalizeResponse>(
        `/interview/${interviewId}/finalize`,
        {}
      );
      setDecision(final);
      setQuestion("");
    } else {
      setQuestion(data.next_question || "");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">AI Interview</h1>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {!interviewId ? (
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white"
            onClick={startInterview}
          >
            Start interview
          </button>
        ) : (
          <>
            <div className="text-sm text-slate-300">{question}</div>
            <textarea
              className="mt-3 w-full rounded bg-slate-950 p-2 text-slate-100"
              rows={3}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <button
              className="mt-3 rounded bg-blue-500 px-4 py-2 text-white"
              onClick={submitAnswer}
            >
              Submit answer
            </button>
          </>
        )}
      </div>
      {decision ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="text-lg font-semibold">Decision Pack</div>
          <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-300">
            {JSON.stringify(decision.decision_pack, null, 2)}
          </pre>
        </div>
      ) : null}
    </main>
  );
}
