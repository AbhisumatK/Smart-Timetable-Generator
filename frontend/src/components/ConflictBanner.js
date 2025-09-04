export default function ConflictBanner({ conflicts }) {
  return (
    <div className="bg-amber-500/20 border border-amber-500/30 text-amber-200 px-4 py-3 mb-4 rounded-lg backdrop-blur">
      <strong className="text-amber-100">Conflicts/Warnings:</strong>
      <ul className="pl-6 list-disc mt-2">
        {conflicts.map((c, i) => <li key={i} className="text-amber-200/90">{c}</li>)}
      </ul>
    </div>
  );
}