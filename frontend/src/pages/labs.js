import { useScheduler } from "../context/SchedulerContext";
import { useTheme } from "../context/ThemeContext";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";

LabsPage.auth = true;
export default function LabsPage() {
  const { labs, setLabs, timeSlots } = useScheduler();
  const { isDark } = useTheme();
  const [error, setError] = useState("");
  const router = useRouter();
  const [labName, setLabName] = useState("");
  const [labDuration, setLabDuration] = useState("");
  const [labPreferred, setLabPreferred] = useState("");
  const [labRoom, setLabRoom] = useState("");

  const preferredStartOptions = useMemo(() => {
    if (!Array.isArray(timeSlots)) return [];
    return Array.from(new Set(timeSlots.map((s) => (typeof s === "string" && s.includes("-") ? s.split("-")[0] : s))));
  }, [timeSlots]);

  function addLabEntry({ name, duration, preferred, room }) {
    if (!name || !duration || duration < 1 || duration > (timeSlots?.length || 0)) {
      setError("Provide lab name and valid number of consecutive classes.");
      return false;
    }
    setError("");
    setLabs([...labs, { name, duration, preferred: preferred || null, room: room || "" }]);
    return true;
  }

  function removeLab(i) {
    setLabs(labs.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <Navbar />
      {/* Add padding above the Stepper */}
      <div className="pt-8">
        <Stepper step={4} />
      </div>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center mb-8">
            <h2 className="section-header">Add Lab Class</h2>
            <p className="section-subtitle">Provide a lab name, number of consecutive classes, optional preferred start time (from your slots), and the lab classroom.</p>
          </div>

          <div className="card p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Lab name</label>
              <input
                className="input"
                placeholder="e.g., OOPS Lab"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Number of classes</label>
              <input
                className="input"
                type="number"
                min={1}
                placeholder="e.g., 2"
                value={labDuration}
                onChange={(e) => setLabDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Classroom</label>
              <input className="input" placeholder="e.g., Lab A318" value={labRoom} onChange={(e)=>setLabRoom(e.target.value)} />
            </div>
            <div>
              <label className="label">Preferred start (optional)</label>
              <select
                className={`input ${isDark ? "bg-slate-900/80 text-slate-100 border-slate-600 focus:ring-cyan-500/60" : ""}`}
                value={labPreferred}
                onChange={(e)=>setLabPreferred(e.target.value)}
              >
                <option value="">No preference</option>
                {preferredStartOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn-primary"
              onClick={() => {
                const ok = addLabEntry({ name: (labName || '').trim(), duration: parseInt(labDuration), preferred: (labPreferred || '').trim(), room: (labRoom || '').trim() });
                if (ok) {
                  setLabName("");
                  setLabDuration("");
                  setLabPreferred("");
                  setLabRoom("");
                }
              }}
            >
              Add Lab
            </button>
            
          </div>

          {error && <div className={`p-3 border rounded-lg text-sm ${
            isDark 
              ? "text-red-400 bg-red-500/10 border-red-500/20" 
              : "text-red-700 bg-red-500/20 border-red-500/40"
          }`}>{error}</div>}

          {labs.length > 0 && (
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className={`text-lg font-semibold mb-3 ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}>Added Labs</h3>
              <div className="space-y-2 max-h-64 overflow-auto">
                {labs.map((l, i) => (
                  <div key={i} className="card-compact flex items-center justify-between">
                    <div className={isDark ? "text-slate-200" : "text-slate-800"}>
                      <div className="font-semibold">{l.name}</div>
                      <div className={`text-sm ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}>{l.duration} classes{l.room ? ` · Room ${l.room}` : ''}</div>
                      {l.preferred && <div className={`text-xs mt-1 ${
                        isDark ? "text-slate-500" : "text-slate-700"
                      }`}>Preferred start: {l.preferred}</div>}
                    </div>
                    <button className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                        : "text-red-600 hover:text-red-700 hover:bg-red-500/20"
                    }`} onClick={() => removeLab(i)} aria-label={`Remove lab ${l.name}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button 
              className="btn-secondary"
              onClick={() => router.push("/fixedClasses")}
            >
              Back
            </button>
            <button
              className="btn-primary"
              onClick={() => router.push("/classrooms")}
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

function ScrollColumn({ options, value, onChange, ariaLabel, isDark }) {
  return (
    <div className={`rounded-lg border backdrop-blur p-2 ${
      isDark 
        ? "border-slate-700/50 bg-slate-900/40" 
        : "border-slate-300/50 bg-slate-100/40"
    }`}>
      <div className="h-40 overflow-y-auto snap-y snap-mandatory pr-1">
        <ul className="space-y-1">
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <li key={opt} className="snap-start">
                <button
                  type="button"
                  aria-label={`${ariaLabel} ${opt}`}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selected 
                      ? `bg-cyan-600/30 border border-cyan-500/30 ${isDark ? "text-slate-100" : "text-slate-900"}` 
                      : `${isDark ? "text-slate-300 hover:bg-slate-800/60" : "text-slate-700 hover:bg-slate-200/60"}`
                  }`}
                  onClick={() => onChange(opt)}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}