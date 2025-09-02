import { useScheduler } from "../context/SchedulerContext";
import Navbar from "../components/Navbar";
import TimetableTable from "../components/TimetableTable";
import ConflictBanner from "../components/ConflictBanner";
import Stepper from "../components/Stepper";
import { useEffect } from "react";

export default function TimetablePage() {
  const {
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
  } = useScheduler();

  // Generate timetable options on mount or when inputs change
  useEffect(() => {
    if (timeSlots.length && subjects.length) {
      generateTimetables();
    }
  }, [timeSlots, subjects, labs]);

  // When timetableOptions update, set first option as displayed timetable
  useEffect(() => {
    if (timetableOptions.length > 0) {
      // assume timetableOptions is array of { option, schedule }
      const firstSchedule = timetableOptions[0]?.schedule || {};
      // Convert schedule array to day->timeSlot->subject map to match TimetableTable format
      const convertedTimetable = {};

      // Initialize days and slots
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        convertedTimetable[day] = {};
        timeSlots.forEach(slot => {
          convertedTimetable[day][slot] = "--";
        });
      });

      // Fill timetable from schedule
      timetableOptions[0].schedule.forEach(({ day, time, subject }) => {
        if (convertedTimetable[day]) {
          convertedTimetable[day][time] = subject;
        }
      });

      setTimetable(convertedTimetable);
      setConflicts([]); // or derive conflicts if needed
    }
  }, [timetableOptions]);

  return (
    <>
      <Navbar />
      <Stepper step={5} />
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded shadow p-6">
        <h2 className="text-2xl mb-4">Generated Timetable Options</h2>

        {generationError && <p className="text-red-600 mb-4">{generationError}</p>}
        {generating && <p className="mb-4">Generating optimized timetables...</p>}

        {!generating && timetableOptions.length > 1 && (
          <div className="mb-6 space-y-4">
            {timetableOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // Convert selected option to timetable format
                  const converted = {};
                  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
                    converted[day] = {};
                    timeSlots.forEach(slot => {
                      converted[day][slot] = "--";
                    });
                  });

                  option.schedule.forEach(({ day, time, subject }) => {
                    if (converted[day]) converted[day][time] = subject;
                  });

                  setTimetable(converted);
                  setConflicts([]);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                {option.option || `Option ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {conflicts.length > 0 && <ConflictBanner conflicts={conflicts} />}
        {timetable && <TimetableTable timetable={timetable} timeSlots={timeSlots} />}

        <div className="mt-6 text-center">
          <a href="/classrooms" className="text-blue-500 underline">Back</a>
        </div>
      </div>
    </>
  );
}