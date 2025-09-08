import { useScheduler } from "../context/SchedulerContext";
import { useTheme } from "../context/ThemeContext";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import InputList from "../components/InputList";

SubjectsPage.auth = true;
export default function SubjectsPage() {
  const { subjects, setSubjects, facultyAssignments, setFacultyAssignments } = useScheduler();
  const { isDark } = useTheme();
  const [error, setError] = useState("");
  const router = useRouter();

  // Local state for new inputs
  const [nameInput, setNameInput] = useState("");
  const [weeklyInput, setWeeklyInput] = useState("");
  const [facultyInput, setFacultyInput] = useState("");

  function addSubject() {
    const name = nameInput.trim();
    const weekly = parseInt(weeklyInput);
    if (!name || !weekly || weekly <= 0) {
      setError("Please enter valid Subject Name and Weekly Classes.");
      return;
    }
    const faculties = facultyInput.split(",").map(f => f.trim()).filter(f => f); // array of faculty

    // Prevent duplicate subject
    if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setError("Subject already added.");
      return;
    }

    setSubjects([...subjects, { name, weekly }]);
    setFacultyAssignments({ ...facultyAssignments, [name]: faculties });

    // Reset inputs and error
    setNameInput("");
    setWeeklyInput("");
    setFacultyInput("");
    setError("");
  }

  function removeSubject(i) {
    const subToRemove = subjects[i];
    setSubjects(subjects.filter((_, idx) => idx !== i));
    // Remove faculty entry as well
    const updatedFac = { ...facultyAssignments };
    delete updatedFac[subToRemove.name];
    setFacultyAssignments(updatedFac);
  }

  return (
    <>
      <Navbar />
      {/* Padding above the Stepper */}
      <div className="pt-8">
        <Stepper step={2} />
      </div>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center mb-8">
            <h2 className="section-header">Subjects Configuration</h2>
            <p className="section-subtitle">
              Add your subjects with weekly class requirements and faculty assignments
            </p>
          </div>
          
          <div className="card max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Subject Name</label>
                  <input
                    placeholder="e.g., Mathematics"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Weekly Classes</label>
                  <input
                    placeholder="e.g., 4"
                    value={weeklyInput}
                    onChange={(e) => setWeeklyInput(e.target.value)}
                    type="number"
                    min={1}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Faculty (comma separated)</label>
                <input
                  placeholder="e.g., Dr. Smith, Prof. Johnson"
                  value={facultyInput}
                  onChange={(e) => setFacultyInput(e.target.value)}
                  className="input"
                />
              </div>
              
              <button
                onClick={addSubject}
                className="btn-primary w-full"
              >
                Add Subject
              </button>
              {error && <div className="text-red-400 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">{error}</div>}
            </div>

            {subjects.length > 0 && (
              <div className={`mt-8 pt-6 border-t ${isDark ? "border-slate-700/50" : "border-slate-300/50"}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-200" : "text-slate-800"}`}>Added Subjects</h3>
                <div className="space-y-3 max-h-64 overflow-auto">
                  {subjects.map((s, i) => (
                    <div key={i} className="card-compact flex justify-between items-center">
                      <div className={isDark ? "text-slate-200" : "text-slate-800"}>
                        <div className="font-semibold">{s.name}</div>
                        <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {s.weekly} classes per week
                        </div>
                        <div className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-700"}`}>
                          Faculty: {(facultyAssignments[s.name] || []).join(", ") || "None assigned"}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSubject(i)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        aria-label={`Remove subject ${s.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`flex justify-between mt-8 pt-6 border-t ${isDark ? "border-slate-700/50" : "border-slate-300/50"}`}>
              <button
                className="btn-secondary"
                onClick={() => router.push("/timeslots")}
              >
                Back
              </button>
              <button
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={subjects.length === 0}
                onClick={() => router.push("/fixedClasses")}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}