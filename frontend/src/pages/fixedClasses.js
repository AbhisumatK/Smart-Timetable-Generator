import { useState } from "react";
import { useScheduler } from "../context/SchedulerContext";
import { useTheme } from "../context/ThemeContext";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

FixedClassesPage.auth = true;
export default function FixedClassesPage() {
  const { fixedClasses, setFixedClasses, classrooms, timeSlots } = useScheduler();
  const { isDark } = useTheme();
  const [day, setDay] = useState("");
  const [room, setRoom] = useState("");
  const [subject, setSubject] = useState("");
  const [faculty, setFaculty] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  function toggleTimeSlot(ts) {
    setSelectedTimes((prev) => (prev.includes(ts) ? prev.filter(t => t !== ts) : [...prev, ts]));
  }

  function addFixedClass() {
    if (!subject.trim()) {
      setError("Subject/Event name is required");
      return;
    }
    if (!day || selectedTimes.length === 0 || !room) {
      setError("Select day, at least one time slot, and room");
      return;
    }
    setError("");
    const base = { day, room, subject: subject.trim(), faculty: faculty.trim() };
    const entries = selectedTimes.map((t) => ({ ...base, time: t }));
    setFixedClasses([...fixedClasses, ...entries]);
    // Reset inputs if desired
    setSubject("");
    setFaculty("");
    setSelectedTimes([]);
  }

  function removeFixedClass(index) {
    setFixedClasses(fixedClasses.filter((_, i) => i !== index));
  }

  return (
    <>
      <Navbar />
      {/* Padding above the Stepper */}
      <div className="pt-8">
        <Stepper step={3} />
      </div>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center mb-8">
            <h2 className="section-header">Fixed Classes / Events</h2>
            <p className="section-subtitle">Lock specific sessions to a day, time and room</p>
          </div>

          <div className={`card max-w-2xl mx-auto ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`label ${isDark ? "text-cyan-200" : "text-cyan-800"}`}>Day</label>
                  <input
                    list="days-list"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="input"
                    placeholder="Select or type day"
                  />
                  <datalist id="days-list">
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className={`label ${isDark ? "text-cyan-200" : "text-cyan-800"}`}>Room</label>
                  <input
                    list="rooms-list"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="input"
                    placeholder="Select or type room"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`label ${isDark ? "text-cyan-200" : "text-cyan-800"}`}>Subject / Event Name</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g., Seminar on AI"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className={`label ${isDark ? "text-cyan-200" : "text-cyan-800"}`}>Time Slots (select one or more)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(timeSlots || []).map((ts) => {
                    const active = selectedTimes.includes(ts);
                    return (
                      <button
                        key={ts}
                        type="button"
                        onClick={() => toggleTimeSlot(ts)}
                        className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                          active
                            ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                            : isDark
                              ? "border-slate-600/50 text-slate-300 hover:bg-slate-800/60"
                              : "border-slate-400/50 text-slate-700 hover:bg-slate-200/60"
                        }`}
                        aria-pressed={active}
                      >
                        {ts}
                      </button>
                    );
                  })}
                </div>
                {selectedTimes.length > 0 && (
                  <div className={`mt-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Selected: {selectedTimes.join(", ")}
                  </div>
                )}
              </div>

              <div>
                <label className={`label ${isDark ? "text-cyan-200" : "text-cyan-800"}`}>Faculty (optional)</label>
                <input
                  type="text"
                  value={faculty}
                  onChange={e => setFaculty(e.target.value)}
                  placeholder="e.g., Prof. Smith"
                  className="input"
                />
              </div>

              <button onClick={addFixedClass} className="btn-primary w-full">
                Add Fixed Class
              </button>
              {error && (
                <div className="text-red-400 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">{error}</div>
              )}
            </div>

            {fixedClasses.length > 0 && (
              <div className={`mt-8 pt-6 border-t ${isDark ? "border-slate-700/50" : "border-slate-300/50"}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-200" : "text-slate-800"}`}>Existing Fixed Classes</h3>
                <ul className="space-y-3 max-h-64 overflow-auto">
                  {fixedClasses.map((fc, idx) => (
                    <li key={idx} className="card-compact flex justify-between items-start">
                      <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                        <strong>{fc.subject}</strong> on {fc.day} at {fc.time} in {fc.room}
                        {fc.faculty && `, Faculty: ${fc.faculty}`}
                      </span>
                      <button
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        onClick={() => removeFixedClass(idx)}
                        aria-label={`Remove fixed class ${fc.subject}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`flex justify-between mt-8 pt-6 border-t ${isDark ? "border-slate-700/50" : "border-slate-300/50"}`}>
              <button className="btn-secondary" onClick={() => router.push("/subjects")}>
                Back
              </button>
              <button className="btn-primary" onClick={() => router.push("/labs")}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}