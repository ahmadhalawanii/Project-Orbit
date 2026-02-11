"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import PortfolioCard from "../../components/PortfolioCard";

type PortfolioResponse = {
  user_id: string;
  summary?: string;
  target_roles: string[];
  preferences: Record<string, string>;
  claims: Array<{ claim: string }>;
  competencies: Array<{ dimension: string; note: string }>;
  flags: Array<{ type: string; note: string }>;
};

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);

  useEffect(() => {
    apiGet<PortfolioResponse>("/portfolio/u1").then(setPortfolio).catch(() => {
      setPortfolio({
        user_id: "u1",
        target_roles: [],
        preferences: {},
        claims: [],
        competencies: [],
        flags: []
      });
    });
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Candidate Portfolio</h1>
      <p className="mt-2 text-slate-300">
        This portfolio updates after intake and chat sessions.
      </p>
      <div className="mt-6">
        {portfolio ? <PortfolioCard portfolio={portfolio} /> : "Loading..."}
      </div>
    </main>
  );
}
