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
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");
  const [subject, setSubject] = useState("");
  const [faculty, setFaculty] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function addFixedClass() {
    if (!subject.trim()) {
      setError("Subject/Event name is required");
      return;
    }
    if (!day || !time || !room) {
      setError("Day, Time, and Room must be selected");
      return;
    }
    setError("");
    const newEntry = { day, time, room, subject: subject.trim(), faculty: faculty.trim() };
    setFixedClasses([...fixedClasses, newEntry]);
    // Reset inputs if desired
    setSubject("");
    setFaculty("");
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
                  <label className={`label ${isDark ? "text-cyan-200" : "text-cyan-800"}`}>Time Slot</label>
                  <input
                    list="timeslots-list"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input"
                    placeholder="Select or type time slot"
                  />
                  <datalist id="timeslots-list">
                    {(timeSlots || []).map((ts, i) => (
                      <option key={i} value={ts} />
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
                  <datalist id="rooms-list">
                    {(classrooms || []).map((r, i) => (
                      <option key={i} value={r} />
                    ))}
                  </datalist>
                </div>
                <div>
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