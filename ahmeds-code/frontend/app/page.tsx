import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0a0a0f] to-[#1e1b4b]">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e8e6e3] mb-4">
          Project Orbit
        </h1>
        <p className="text-[#e8e6e3]/80 mb-8">
          A space-themed, conversational hiring experience. No long forms — just your story and evidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/applicant"
            className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition"
          >
            I&apos;m an Applicant
          </Link>
          <Link
            href="/recruiter"
            className="px-6 py-3 rounded-lg border border-[#e8e6e3]/40 text-[#e8e6e3] font-medium hover:bg-[#e8e6e3]/10 transition"
          >
            Recruiter Cockpit
          </Link>
        </div>
      </div>
    </main>
  );
}
