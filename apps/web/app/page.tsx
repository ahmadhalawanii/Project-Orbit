import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 px-6">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-semibold text-slate-100">Project Orbit</h1>
        <p className="mt-3 text-slate-300">
          A space-themed, conversational hiring experience. No long forms — just
          your story and evidence.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white"
            href="/applicant"
          >
            I&apos;m an Applicant
          </Link>
          <Link
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100"
            href="/hr"
          >
            Recruiter Cockpit
          </Link>
        </div>
      </div>
    </main>
  );
}
