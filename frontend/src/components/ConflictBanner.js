export default function ConflictBanner({ conflicts }) {
  return (
    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 mb-4 rounded">
      <strong>Conflicts/Warnings:</strong>
      <ul className="pl-6 list-disc">
        {conflicts.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </div>
  );
}