import { useScheduler } from "../context/SchedulerContext";

TimetableGenerator.auth = true;
export default function TimetableGenerator() {
  const {
    timetableOptions, generating, generationError, generateTimetables
  } = useScheduler();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl mb-4 font-semibold">Generate Optimized Timetables</h1>
      <button
        onClick={generateTimetables}
        disabled={generating}
        className="bg-blue-600 px-5 py-2 text-white rounded hover:bg-blue-700"
      >
        {generating ? "Generating..." : "Generate Timetables"}
      </button>
      {generationError && <p className="mt-3 text-red-600">{generationError}</p>}

      {timetableOptions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl mb-3">Select a Timetable Option</h2>
          {timetableOptions.map((opt, idx) => (
            <div key={idx} className="bg-gray-100 p-3 rounded my-2">
              <strong>{opt.option || `Option ${idx + 1}`}</strong>
              <pre className="text-sm overflow-auto max-h-64 mt-2 whitespace-pre-wrap">
                {JSON.stringify(opt.schedule || opt, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}