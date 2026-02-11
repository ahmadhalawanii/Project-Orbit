import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-hero flex flex-col items-center justify-center p-6">
      <div className="relative text-center max-w-2xl">
        <p className="text-[#e8e6e3]/70 uppercase tracking-[0.4em] text-sm md:text-base mb-3">
          Project
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-[#e8e6e3] mb-4">
          <span className="orbit-logo-static">
            <span className="orbit-planet" aria-hidden="true" />
            <span className="orbit-rbit">rbit</span>
          </span>
        </h1>
        <p className="text-[#e8e6e3]/80 mb-10 text-base md:text-lg">
          A space-themed, conversational hiring experience. No long forms — just your story and evidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/applicant"
            className="px-6 py-3 rounded-lg bg-[#22d3ee] text-[#0a0a0f] font-medium hover:bg-[#22d3ee]/90 transition"
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
