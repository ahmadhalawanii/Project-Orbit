"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listApplications } from "@/lib/api";
import type { ApplicationListItem } from "@/lib/api";

const STAGE_LABELS: Record<string, string> = {
  pluto: "Pluto",
  mercury: "Mercury",
  asteroid_belt: "Asteroid Belt",
  mars: "Mars",
  saturn: "Saturn",
  earth: "Earth",
  launchpad: "Mercury",
  spacewalk: "Mars",
  docking_station: "Saturn",
  mission_control: "Earth",
};

export default function RecruiterPipelinePage() {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listApplications()
      .then((data) => {
        setApplications(data);
        setError(null);
      })
      .catch(() => setError("Could not load pipeline. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-6 bg-[#0a0a0f] text-[#e8e6e3]">
      <div className="max-w-5xl mx-auto">
        <Link href="/recruiter" className="text-[#22d3ee] hover:underline text-sm mb-4 inline-block">
          ← Cockpit home
        </Link>
        <h1 className="text-2xl font-bold mt-2">Pipeline</h1>
        <p className="text-[#e8e6e3]/70 text-sm mt-1">
          Applicants, status, and current stage. New applications appear here as candidates launch missions.
        </p>

        {loading && <p className="text-[#e8e6e3]/60 mt-6">Loading pipeline…</p>}
        {error && (
          <p className="text-[#f97316] mt-6" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && applications.length === 0 && (
          <p className="text-[#e8e6e3]/60 mt-6">No applications yet. Have someone start from &quot;I&apos;m an Applicant&quot; and launch a mission.</p>
        )}
        {!loading && !error && applications.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg border border-[#e8e6e3]/20">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e8e6e3]/20 bg-[#1e1b4b]/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-[#e8e6e3]">Applicant</th>
                  <th className="px-4 py-3 font-medium text-[#e8e6e3]">Role / Mission</th>
                  <th className="px-4 py-3 font-medium text-[#e8e6e3]">Stage</th>
                  <th className="px-4 py-3 font-medium text-[#e8e6e3]">Status</th>
                  <th className="px-4 py-3 font-medium text-[#e8e6e3]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e6e3]/10">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#e8e6e3]/5">
                    <td className="px-4 py-3 text-[#e8e6e3]/90">
                      {app.applicant_email ?? app.applicant_id}
                    </td>
                    <td className="px-4 py-3 text-[#e8e6e3]/90">
                      {app.role_title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#22d3ee]">
                      {STAGE_LABELS[app.current_stage] ?? app.current_stage}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          app.status === "submitted"
                            ? "text-[#22c55e]"
                            : "text-[#e8e6e3]/70"
                        }
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/recruiter/applications/${app.id}`}
                        className="text-[#22d3ee] hover:underline"
                      >
                        View portfolio & score
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
