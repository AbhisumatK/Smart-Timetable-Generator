import { useState, useEffect } from "react";
import { useScheduler } from "../context/SchedulerContext";
import Navbar from "../components/Navbar";
import TimetableTable from "../components/TimetableTable";
import ConflictBanner from "../components/ConflictBanner";
import Stepper from "../components/Stepper";

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
    addDraft,
  } = useScheduler();

  const [customizeMode, setCustomizeMode] = useState(false);
  const [originalTimetable, setOriginalTimetable] = useState(null);

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

  useEffect(() => {
    if (!customizeMode) {
      setOriginalTimetable(timetable);
    }
  }, [customizeMode, timetable]);

  const handleSave = () => {
    setCustomizeMode(false);
  };

  const handleCancel = () => {
    if (originalTimetable) {
      setTimetable(originalTimetable);
    }
    setConflicts([]);
    setCustomizeMode(false);
  };

  const handleSubmitForApproval = async () => {
    if (!timetable) return alert("No timetable to submit");
    
    const draft = {
      timetable,
      timeSlots,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    
    try {
      const res = await fetch("/api/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Failed to submit draft");
      
      alert("Draft submitted for approval.");
      setCustomizeMode(false);
    } catch (error) {
      alert("Error submitting draft: " + error.message);
    }
  };

  return (
    <>
      <Navbar />
      <Stepper step={6} />
      <div className="container max-w-4xl mx-auto mt-10 p-6">
        <div className="card p-6">
          <h2 className="text-2xl mb-4 text-white">Generated Timetable Options</h2>

          {generationError && <p className="text-red-300 mb-4">{generationError}</p>}
          {generating && <p className="mb-4 text-white/80">Generating optimized timetables...</p>}

          {!generating && Array.isArray(timetableOptions) && timetableOptions.length > 1 && !customizeMode && (
            <div className="mb-6 space-y-4">
              {timetableOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTimetable(option.timetable);
                    setConflicts([]);
                    setCustomizeMode(false);
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

          {!generating && timetable && (
            <TimetableTable
              timetable={timetable}
              timeSlots={timeSlots}
              customizeMode={customizeMode}
              onTimetableChange={(newTimetable) => {
                setTimetable(newTimetable);
                setConflicts([]);
              }}
            />
          )}

          {!generating && (
            !customizeMode ? (
              <div className="flex gap-4 mb-6">
                <button onClick={() => setCustomizeMode(true)} className="btn-primary">
                  Customize Schedule
                </button>
                <button onClick={handleSubmitForApproval} className="btn-primary">
                  Save as Draft
                </button>
              </div>
            ) : (
              <div className="flex gap-4 mb-6">
                <button onClick={handleSave} className="btn-primary">
                  Save Schedule
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSubmitForApproval} className="btn-success">
                  Save as Draft
                </button>
              </div>
            )
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