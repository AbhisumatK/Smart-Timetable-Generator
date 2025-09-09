import { useScheduler } from "../context/SchedulerContext";
import { useTheme } from "../context/ThemeContext";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Link from "next/link";

TimeSlotsPage.auth = true;
export default function TimeSlotsPage() {
  const { timeSlots, setTimeSlots, lunchSlot, setLunchSlot } = useScheduler();
  const { isDark } = useTheme();
  const [error, setError] = useState("");
  const router = useRouter();
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), []);
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [manualInput, setManualInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [numClasses, setNumClasses] = useState("");
  const [periodMinutes, setPeriodMinutes] = useState(60);

  function addSlot(slot) {
    slot = slot.trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(slot)) {
      setError("Invalid format. Use HH:MM-HH:MM.");
      return false;
    }
    setError("");
    setTimeSlots([...timeSlots, slot]);
    return true;
  }

  function removeSlot(i) {
    const removed = timeSlots[i];
    const next = timeSlots.filter((_, idx) => idx !== i);
    setTimeSlots(next);
    if (removed === lunchSlot) setLunchSlot(null);
  }

  function generatePeriods() {
    const n = Number(numClasses);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Enter a valid positive number of classes.");
      return;
    }
    setError("");
    const slots = Array.from({ length: n }, (_, i) => `P${i + 1}`);
    setTimeSlots(slots);
    setLunchSlot(null);
  }

  function toMinutes(hh, mm) {
    return Number(hh) * 60 + Number(mm);
  }
  function fromMinutes(total) {
    const h = Math.floor((total % (24 * 60)) / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function generateByStartAndDuration() {
    const n = Number(numClasses);
    const p = Number(periodMinutes);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Enter a valid positive number of classes.");
      return;
    }
    if (!Number.isInteger(p) || p <= 0) {
      setError("Enter a valid positive period duration (minutes).");
      return;
    }
    const start = toMinutes(startHour, startMinute);
    const newSlots = [];
    let current = start;
    for (let i = 0; i < n; i++) {
      const next = current + p;
      const slot = `${fromMinutes(current)}-${fromMinutes(next)}`;
      newSlots.push(slot);
      current = next;
    }
    setError("");
    setTimeSlots(newSlots);
    setLunchSlot(null);
  }

  function clearAll() {
    setTimeSlots([]);
    setLunchSlot(null);
  }

  return (
    <>
      <Navbar />
      {/* Padding above the Stepper */}
      <div className="pt-8">
        <Stepper step={1} />
      </div>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center mb-8">
            <h2 className="section-header">Time Slots Configuration</h2>
            <p className="section-subtitle">
              Either add explicit time ranges or auto-generate from college start time, period duration, and number of classes.
            </p>
          </div>
          
          <div className="card max-w-3xl mx-auto">
            <label className="label">Add Explicit Time Slot</label>

            <div className="relative">
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="e.g., 09:00-10:00"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (addSlot(manualInput)) setManualInput("");
                    }
                  }}
                  aria-label="Time slot manual input"
                />
                <button
                  type="button"
                  className={`group card-compact flex items-center justify-center px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-500/40 ${
                    isDark 
                      ? "border-slate-600/50 text-slate-300 hover:text-slate-100" 
                      : "border-slate-500 text-slate-900 hover:text-black"
                  }`}
                  aria-label="Open time scroller"
                  aria-expanded={showPicker}
                  onClick={() => setShowPicker((v) => !v)}
                >
                  <svg className={`h-5 w-5 text-inherit ${isDark ? "group-hover:text-cyan-300" : "group-hover:text-cyan-600"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (addSlot(manualInput)) setManualInput("");
                  }}
                >
                  Add
                </button>
              </div>

              {showPicker && (
                <div className={`absolute z-20 mt-2 w-full md:w-[38rem] rounded-xl border backdrop-blur p-4 shadow-xl ${
                  isDark 
                    ? "border-slate-700/60 bg-slate-900/95" 
                    : "border-slate-500/70 bg-white"
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className={`mb-2 font-semibold ${isDark ? "text-slate-300" : "text-slate-900"}`}>Start time</div>
                      <div className="grid grid-cols-2 gap-3">
                        <ScrollColumn options={hours} value={startHour} onChange={setStartHour} ariaLabel="Start hour" isDark={isDark} />
                        <ScrollColumn options={minutes} value={startMinute} onChange={setStartMinute} ariaLabel="Start minute" isDark={isDark} />
                      </div>
                    </div>
                    <div>
                      <div className={`mb-2 font-semibold ${isDark ? "text-slate-300" : "text-slate-900"}`}>End time</div>
                      <div className="grid grid-cols-2 gap-3">
                        <ScrollColumn options={hours} value={endHour} onChange={setEndHour} ariaLabel="End hour" isDark={isDark} />
                        <ScrollColumn options={minutes} value={endMinute} onChange={setEndMinute} ariaLabel="End minute" isDark={isDark} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className={`card-compact px-4 py-2 border rounded-lg ${
                        isDark 
                          ? "text-slate-300 hover:bg-slate-800/60 border-slate-600/50" 
                          : "text-slate-900 hover:bg-slate-200/80 border-slate-500"
                      }`}
                      onClick={() => setShowPicker(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        const slot = `${startHour}:${startMinute}-${endHour}:${endMinute}`;
                        setManualInput(slot);
                        setShowPicker(false);
                      }}
                    >
                      Insert time
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Generate contiguous time ranges */}
            <div className="mt-8">
              <div className="label mb-2">Auto-Generate Time Slots</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs block mb-1">Start Time</label>
                  <div className="flex gap-2">
                    <select className="input" value={startHour} onChange={(e)=>setStartHour(e.target.value)} aria-label="Start hour">
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="input" value={startMinute} onChange={(e)=>setStartMinute(e.target.value)} aria-label="Start minute">
                      {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs block mb-1">Period Duration (minutes)</label>
                  <input type="number" min="1" className="input" value={periodMinutes} onChange={(e)=>setPeriodMinutes(e.target.value)} placeholder="e.g., 60" />
                </div>
                <div>
                  <label className="text-xs block mb-1">Number of Classes</label>
                  <input type="number" min="1" className="input" value={numClasses} onChange={(e)=>setNumClasses(e.target.value)} placeholder="e.g., 7" />
                </div>
              </div>
              <div className="mt-3">
                <button className="btn-primary" onClick={generateByStartAndDuration}>Generate</button>
                <button className="btn-secondary ml-2" onClick={clearAll}>Clear</button>
              </div>
              <p className={`mt-2 text-xs ${isDark ? "text-slate-400" : "text-slate-800"}`}>Creates contiguous HH:MM-HH:MM slots from the start time.</p>
            </div>

            {error && <div className="text-red-400 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">{error}</div>}

            <div className="mt-6">
              <div className="label mb-2">Current Time Slots</div>
              <div className="space-y-2">
                {timeSlots.map((item, i) => (
                  <div key={i} className="card flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={isDark ? "text-slate-200" : "text-slate-900"}>{item}</span>
                      {item === lunchSlot && <span className={`text-xs ${isDark ? "text-amber-300" : "text-amber-700"}`}>(Lunch)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-2 py-1 rounded-md border text-xs ${
                          item === lunchSlot
                            ? (isDark ? "border-amber-400 text-amber-300" : "border-orange-600 text-orange-700")
                            : isDark
                              ? "border-slate-600/50 text-slate-300 hover:bg-slate-800/60"
                              : "border-slate-500 text-slate-900 hover:bg-slate-200/80"
                        }`}
                        onClick={() => setLunchSlot(item === lunchSlot ? null : item)}
                        aria-pressed={item === lunchSlot}
                      >
                        {item === lunchSlot ? "Unset Lunch" : "Set Lunch"}
                      </button>
                      <button className={`${isDark ? "text-red-400 hover:text-red-300 font-semibold" : "text-red-600 hover:text-red-700 font-semibold"}`} onClick={() => removeSlot(i)}>Remove</button>
                    </div>
                  </div>
                ))}
                {timeSlots.length === 0 && (
                  <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>No time slots added yet.</div>
                )}
              </div>
            </div>
            
            <div className={`flex justify-between mt-8 pt-6 border-t ${isDark ? "border-slate-700/50" : "border-slate-500"}`}>
              <button className="btn-secondary" onClick={() => router.push("/")}>Back</button>
              <button
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={timeSlots.length === 0}
                onClick={() => router.push("/subjects")}>
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