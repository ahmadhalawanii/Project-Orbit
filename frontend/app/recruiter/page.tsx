"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecruiterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("recruiter@example.com");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/demo-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role: "recruiter" }),
        }
      );
      if (!res.ok) throw new Error("Login failed");
      const { token } = await res.json();
      document.cookie = `orbit_session=${token}; path=/; max-age=${86400 * 7}`;
      router.push("/recruiter/pipeline");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.");
    }
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0f] to-[#1e1b4b]">
      <Link href="/" className="absolute top-6 left-6 text-[#22d3ee] hover:underline text-sm">
        ← Back to Orbit
      </Link>
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-2xl font-bold text-[#e8e6e3] text-center">Recruiter Cockpit</h1>
        <p className="text-[#e8e6e3]/70 text-sm text-center">Demo login. Use any email to enter.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-[#e8e6e3]/30 bg-[#0a0a0f] px-4 py-2 text-[#e8e6e3] placeholder:text-[#e8e6e3]/50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
        />
        {error && <p className="text-[#f97316] text-sm">{error}</p>}
        <button
          type="button"
          onClick={handleLogin}
          className="w-full px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
        >
          Enter cockpit
        </button>
      </div>
    </main>
  );
}
