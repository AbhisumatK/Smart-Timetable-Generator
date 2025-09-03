import { useScheduler } from "../context/SchedulerContext";
import Navbar from "../components/Navbar";
import TimetableTable from "../components/TimetableTable";
import ConflictBanner from "../components/ConflictBanner";
import Stepper from "../components/Stepper";
import { useEffect } from "react";

export default function TimetablePage() {
  const {
    classrooms,
    timeSlots,
    subjects,
    labs,
    timetable,
    setTimetable,
    conflicts,
    setConflicts,
    timetableOptions,
    setTimetableOptions,
    generating,
    generationError,
    generateTimetables,
    facultyAssignments,
    fixedClasses,
  } = useScheduler();

  // Trigger generation on timeSlots or subjects change
  useEffect(() => {
    if (timeSlots.length && subjects.length) {
      generateTimetables({
        classrooms: Object.keys(classrooms),
        timeSlots,
        subjects: subjects.map((s) => ({ name: s.name, weekly: s.weekly })),
        facultyAvailability: facultyAssignments,
        fixedClasses,
      });
    }
  }, [timeSlots, subjects]);

  // useEffect(() => {
  //   if (Array.isArray(timetableOptions) && timetableOptions.length > 0) {
  //     setTimetable(timetableOptions[0].timetable);
  //     setConflicts([]);
  //   }
  // }, [timetableOptions]);

  return (
    <>
      <Navbar />
      <Stepper step={6} />
      <div className="container max-w-4xl mx-auto mt-10 p-6">
        <div className="card p-6">
          <h2 className="text-2xl mb-4 text-white">Generated Timetable Options</h2>

          {generationError && <p className="text-red-300 mb-4">{generationError}</p>}
          {generating && <p className="mb-4 text-white/80">Generating optimized timetables...</p>}

          {!generating && Array.isArray(timetableOptions) && timetableOptions.length > 1 && (
            <div className="mb-6 space-y-4">
              {timetableOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTimetable(option.timetable);
                    setConflicts([]);
                  }}
                  className="card p-4 w-full text-left hover:bg-white/10 transition-colors"
                >
                  <strong className="text-white">{option.recommendation ? `Option ${idx + 1}` : `Option ${idx + 1}`}</strong>
                  <p className="italic text-sm text-white/70 mt-1">{option.recommendation}</p>
                </button>
              ))}
            </div>
          )}

          {conflicts.length > 0 && <ConflictBanner conflicts={conflicts} />}
          {timetable && timetable !== null && (
            <TimetableTable timetable={timetable} timeSlots={timeSlots} />
          )}

          <div className="mt-6 text-center">
            <a href="/classrooms" className="text-cyan-300 hover:text-cyan-200 underline">
              Back
            </a>
          </div>
        </div>
      </div>
    </>
  );
}