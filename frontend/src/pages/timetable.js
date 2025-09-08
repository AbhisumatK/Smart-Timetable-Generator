import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useScheduler } from "../context/SchedulerContext";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import TimetableTable from "../components/TimetableTable";
import ConflictBanner from "../components/ConflictBanner";
import Stepper from "../components/Stepper";

TimetablePage.auth = true;

export default function TimetablePage() {
  const router = useRouter();
  const { isDark } = useTheme();

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
  const [hasSelectedOption, setHasSelectedOption] = useState(false);

  useEffect(() => {
    if (timeSlots.length && subjects.length && classrooms.length && facultyAssignments.length) {
      generateTimetables({
        classrooms: classrooms, // assuming classrooms is an array
        timeSlots,
        labs,
        subjects: subjects.map((s) => ({ name: s.name, weekly: s.weekly })),
        facultyAvailability: facultyAssignments,
        fixedClasses,
      });
    }
  }, [timeSlots, subjects, classrooms, labs, facultyAssignments, fixedClasses]);

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
      // Include user or other metadata if needed here
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
      <div className="pt-8">
        <Stepper step={6} />
      </div>
      <div className="container max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8 md:p-10 space-y-6">
          <h2
            className={`text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent drop-shadow-lg ${
              isDark
                ? "from-cyan-400 via-blue-400 to-purple-400"
                : "from-cyan-700 via-blue-700 to-purple-700"
            }`}
          >
            Generated Timetable Options
          </h2>

          {generationError && (
            <p className={isDark ? "text-red-300" : "text-red-700"}>
              {generationError}
            </p>
          )}

          {generating && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                ></div>
              </div>
              <p
                className={`font-semibold mt-4 text-lg ${
                  isDark ? "text-cyan-300" : "text-cyan-700"
                }`}
              >
                Generating optimized timetables...
              </p>
              <p
                className={`text-sm mt-2 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                This may take a few moments
              </p>
            </div>
          )}

          {!generating &&
            Array.isArray(timetableOptions) &&
            timetableOptions.length > 1 &&
            !customizeMode && (
              <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                {timetableOptions.map((option, idx) => {
                  const isSelected = timetable === option.timetable;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setTimetable(option.timetable);
                        setConflicts([]);
                        setCustomizeMode(false);
                        setHasSelectedOption(true)
                      }}
                      className={`card p-4 sm:p-5 w-full text-left transition-all duration-300 rounded-lg group transform animate-in slide-in-from-bottom-4 duration-500 hover:shadow-2xl hover:shadow-cyan-500/20
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-white shadow-2xl shadow-yellow-500/30 scale-105"
                          : isDark
                          ? "bg-gradient-to-br from-slate-700/50 via-slate-600/40 to-slate-700/50 border-cyan-500/20 text-slate-200 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 hover:border-yellow-400 hover:text-white hover:shadow-2xl hover:shadow-yellow-500/30 hover:scale-105 focus:bg-gradient-to-r focus:from-yellow-500 focus:to-orange-500 focus:border-yellow-400 focus:text-white focus:shadow-2xl focus:shadow-yellow-500/30 focus:scale-105 active:bg-gradient-to-r active:from-yellow-600 active:to-orange-600 active:border-yellow-500 active:text-white active:scale-95"
                          : "bg-gradient-to-br from-white/90 via-slate-50/80 to-white/90 border-cyan-500/40 text-slate-800 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 hover:border-yellow-400 hover:!text-white hover:shadow-2xl hover:shadow-yellow-500/30 hover:scale-105 focus:bg-gradient-to-r focus:from-yellow-500 focus:to-orange-500 focus:border-yellow-400 focus:!text-white focus:shadow-2xl focus:shadow-yellow-500/30 focus:scale-105 active:bg-gradient-to-r active:from-yellow-600 active:to-orange-600 active:border-yellow-500 active:!text-white active:scale-95"
                      }
                    `}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <strong
                        className={`block transition-all duration-200 ${
                          isSelected
                            ? "text-white font-bold"
                            : isDark
                            ? "text-slate-200 group-hover:text-white group-hover:font-bold group-focus:text-white group-focus:font-bold group-active:text-white group-active:font-bold"
                            : "text-slate-700 group-hover:!text-black group-hover:font-bold group-focus:!text-black group-focus:font-bold group-active:!text-black group-active:font-bold"
                        }`}
                      >
                        {option.recommendation ? `Option ${idx + 1}` : `Option ${idx + 1}`}
                      </strong>
                      <p
                        className={`text-sm mt-1 transition-all duration-200 font-medium ${
                          isSelected
                            ? "text-white/90"
                            : isDark
                            ? "text-slate-300 group-hover:text-white/90 group-focus:text-white/90 group-active:text-white/90"
                            : "text-slate-600 group-hover:!text-black group-focus:!text-black group-active:!text-black"
                        }`}
                      >
                        {option.recommendation}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

          {conflicts.length > 0 && <ConflictBanner conflicts={conflicts} />}

          {!generating && hasSelectedOption && timetable && (
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

          {!generating &&  hasSelectedOption && (
            !customizeMode ? (
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8">
                <button onClick={() => setCustomizeMode(true)} className="btn-primary">
                  Customize Schedule
                </button>
                <button onClick={handleSubmitForApproval} className="btn-primary">
                  Save as Draft
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8">
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

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => router.push("/classrooms")}
              className="btn-secondary"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
