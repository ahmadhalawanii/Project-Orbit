"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMissionPacks,
  demoLogin,
  getApplicantByUser,
  createApplicant,
  createApplication,
} from "@/lib/api";
import type { MissionPack } from "@/lib/api";

export default function ApplicantPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [packs, setPacks] = useState<MissionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<MissionPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getMissionPacks()
      .then((data) => {
        setPacks(data);
        setLoadError(null);
      })
      .catch(() => {
        setPacks([]);
        setLoadError(
          "Couldn't load mission packs. Is the API running? Start the backend: cd backend && source .venv/bin/activate && python -m uvicorn app.main:app --reload --port 8000"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleStart() {
    if (!email.trim()) {
      setError("Enter your email to continue.");
      return;
    }
    setError(null);
    try {
      const { token, user_id } = await demoLogin(email, "applicant");
      document.cookie = `orbit_session=${token}; path=/; max-age=${86400 * 7}`;
      let applicantId: string;
      try {
        const applicant = await getApplicantByUser(user_id);
        applicantId = applicant.id;
      } catch {
        const applicant = await createApplicant(user_id);
        applicantId = applicant.id;
      }
      if (!selectedPack) {
        setError("Pick a mission (role) to continue.");
        return;
      }
      const app = await createApplication(applicantId, selectedPack.id, selectedPack.name);
      router.push(`/applicant/${app.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-[#0a0a0f] to-[#1e1b4b]">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[#22d3ee] hover:underline text-sm mb-6 inline-block">
          ← Back to Orbit
        </Link>
        <h1 className="text-3xl font-bold text-[#e8e6e3] mb-2">Applicant Journey</h1>
        <p className="text-[#e8e6e3]/80 mb-8">
          Start your space mission. No long forms — we&apos;ll guide you through conversation and
          evidence.
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#e8e6e3] mb-2">
              Email (demo)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#e8e6e3]/30 bg-[#0a0a0f] px-4 py-2 text-[#e8e6e3] placeholder:text-[#e8e6e3]/50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#e8e6e3] mb-2">
              Choose your mission (role)
            </label>
            {loading ? (
              <p className="text-[#e8e6e3]/60">Loading mission packs…</p>
            ) : loadError ? (
              <div
                className="rounded-lg border border-[#f97316]/50 bg-[#f97316]/10 px-4 py-3 text-[#f97316] text-sm"
                role="alert"
              >
                {loadError}
              </div>
            ) : packs.length === 0 ? (
              <p className="text-[#e8e6e3]/60">No mission packs available. Run the backend and seed the database.</p>
            ) : (
              <div className="grid gap-2">
                {packs.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    className={`text-left rounded-lg border px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-[#22d3ee] ${
                      selectedPack?.id === pack.id
                        ? "border-[#6366f1] bg-[#6366f1]/20"
                        : "border-[#e8e6e3]/30 hover:bg-[#e8e6e3]/5"
                    }`}
                  >
                    <span className="font-medium text-[#e8e6e3]">{pack.name}</span>
                    {pack.description && (
                      <p className="text-sm text-[#e8e6e3]/60 mt-1">{pack.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div
              className="rounded-lg border border-[#f97316]/50 bg-[#f97316]/10 px-4 py-3 text-[#f97316] text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={loading || packs.length === 0 || !selectedPack}
            className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Launch mission
          </button>
          {!loading && packs.length > 0 && !selectedPack && (
            <p className="text-sm text-[#e8e6e3]/60">
              Select a mission (role) above, then click Launch mission.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
