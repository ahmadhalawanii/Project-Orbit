type MissionPack = {
  job_family: string;
  brief_md: string;
  deliverables: string[];
};

export default function MissionPackViewer({ pack }: { pack: MissionPack }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">
        Mission Pack: {pack.job_family}
      </h2>
      <p className="mt-2 text-slate-300">{pack.brief_md}</p>
      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-200">Deliverables</div>
        <ul className="mt-2 list-disc pl-4 text-sm text-slate-400">
          {pack.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
