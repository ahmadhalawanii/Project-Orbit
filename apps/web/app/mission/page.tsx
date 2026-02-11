"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";

type MissionPack = {
  id: number;
  job_family: string;
  brief_md: string;
};

export default function MissionPage() {
  const [packs, setPacks] = useState<MissionPack[]>([]);

  useEffect(() => {
    apiGet<MissionPack[]>("/mission/packs").then(setPacks).catch(() => {
      setPacks([]);
    });
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Mission Packs</h1>
      <p className="mt-2 text-slate-300">
        Choose a job family to start a mission sprint.
      </p>
      <div className="mt-6 space-y-3">
        {packs.map((pack) => (
          <Link
            key={pack.id}
            className="block rounded border border-slate-800 bg-slate-900 p-4"
            href={`/mission/${pack.job_family}`}
          >
            <div className="text-lg font-semibold">{pack.job_family}</div>
            <div className="text-sm text-slate-400">{pack.brief_md}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
