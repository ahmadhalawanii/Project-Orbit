import ChatPanel from "../../components/ChatPanel";

export default function ChatPage({
  searchParams
}: {
  searchParams: { mode?: string };
}) {
  const mode = searchParams.mode || "explore";
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Orbit Chat</h1>
      <p className="mt-2 text-slate-300">
        Ask about roles, policies, and onboarding. Answers are grounded in the
        content pack.
      </p>
      <div className="mt-6">
        <ChatPanel mode={mode} />
      </div>
    </main>
  );
}
