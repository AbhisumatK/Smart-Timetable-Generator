import { useScheduler } from "../context/SchedulerContext";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";

export default function LabsPage() {
  const { labs, setLabs, timeSlots } = useScheduler();
  const [error, setError] = useState("");
  const router = useRouter();
  const [labName, setLabName] = useState("");
  const [labDuration, setLabDuration] = useState("");
  const [labPreferred, setLabPreferred] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  function addLab(entry) {
    const [name, durationRaw, slot] = entry.split(",").map(e => (e || '').trim());
    const duration = parseInt(durationRaw);
    if (!name || !duration || duration < 1 || duration > timeSlots.length) {
      setError("Format: LabName,Duration,[OptionalSlot]");
      return false;
    }
    setError("");
    setLabs([...labs, { name, duration, preferred: slot || null }]);
    return true;
  }

  function removeLab(i) {
    setLabs(labs.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <Navbar />
      <Stepper step={4} />
      <div className="container max-w-3xl mx-auto mt-8 p-6">
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">Add Lab Class</h2>
            <p className="text-slate-400 text-sm">Provide a lab name, number of consecutive classes, and optionally a preferred time slot.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="relative">
              <label className="label">Preferred time (optional)</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="e.g., 13:00-14:00"
                  value={labPreferred}
                  onChange={(e) => setLabPreferred(e.target.value)}
                />
                <button
                  type="button"
                  className="group card-compact flex items-center justify-center px-3 py-2 border border-slate-600/50 rounded-lg text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-slate-100"
                  aria-label="Open time scroller"
                  aria-expanded={showPicker}
                  onClick={() => setShowPicker(v => !v)}
                >
                  <svg className="h-5 w-5 text-inherit group-hover:text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                </button>
              </div>
              {showPicker && (
                <div className="absolute z-20 mt-2 w-full md:w-[28rem] rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur p-4 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-300 mb-2 font-semibold">Start</div>
                      <div className="grid grid-cols-2 gap-3">
                        <ScrollColumn options={hours} value={startHour} onChange={setStartHour} ariaLabel="Start hour" />
                        <ScrollColumn options={minutes} value={startMinute} onChange={setStartMinute} ariaLabel="Start minute" />
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-300 mb-2 font-semibold">End</div>
                      <div className="grid grid-cols-2 gap-3">
                        <ScrollColumn options={hours} value={endHour} onChange={setEndHour} ariaLabel="End hour" />
                        <ScrollColumn options={minutes} value={endMinute} onChange={setEndMinute} ariaLabel="End minute" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="card-compact px-4 py-2 text-slate-300 hover:bg-slate-800/60 border border-slate-600/50 rounded-lg"
                      onClick={() => setShowPicker(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        const slot = `${startHour}:${startMinute}-${endHour}:${endMinute}`;
                        setLabPreferred(slot);
                        setShowPicker(false);
                      }}
                    >
                      Insert time
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn-primary"
              onClick={() => {
                const entry = `${(labName || '').trim()},${String(labDuration || '').trim()}${labPreferred ? `,${labPreferred}` : ''}`;
                if (addLab(entry)) {
                  setLabName("");
                  setLabDuration("");
                  setLabPreferred("");
                }
              }}
            >
              Add Lab
            </button>
            
          </div>

          {error && <div className="text-red-400 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">{error}</div>}

          {labs.length > 0 && (
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Added Labs</h3>
              <div className="space-y-2 max-h-64 overflow-auto">
                {labs.map((l, i) => (
                  <div key={i} className="card-compact flex items-center justify-between">
                    <div className="text-slate-200">
                      <div className="font-semibold">{l.name}</div>
                      <div className="text-sm text-slate-400">{l.duration} classes</div>
                      {l.preferred && <div className="text-xs text-slate-500 mt-1">Preferred: {l.preferred}</div>}
                    </div>
                    <button className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" onClick={() => removeLab(i)} aria-label={`Remove lab ${l.name}`}>
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
              className="inline-flex items-center justify-center rounded-lg bg-violet-500/90 hover:bg-violet-400 text-white font-semibold px-4 py-2 transition-colors" 
              onClick={() => router.push("/subjects")}
            >
              Back
            </button>
            <button
              className="inline-flex items-center justify-center rounded-lg bg-cyan-400/90 hover:bg-cyan-300 text-slate-900 font-semibold px-4 py-2 transition-colors"
              onClick={() => router.push("/classrooms")}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ScrollColumn({ options, value, onChange, ariaLabel }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 backdrop-blur p-2">
      <div className="h-40 overflow-y-auto snap-y snap-mandatory pr-1">
        <ul className="space-y-1">
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <li key={opt} className="snap-start">
                <button
                  type="button"
                  aria-label={`${ariaLabel} ${opt}`}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selected ? "bg-cyan-600/30 text-slate-100 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800/60"}`}
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