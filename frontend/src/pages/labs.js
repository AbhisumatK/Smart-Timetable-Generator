import { useScheduler } from "../context/SchedulerContext";
import InputList from "../components/InputList";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";

export default function LabsPage() {
  const { labs, setLabs, timeSlots } = useScheduler();
  const [error, setError] = useState("");
  const router = useRouter();

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
      <div className="container max-w-xl mx-auto mt-8 p-6">
        <div className="card p-6">
          <InputList
            label="Enter Lab Classes"
            value={labs}
            setValue={setLabs}
            placeholder="e.g., OOPS Lab,2,13:00-14:00"
            onAdd={addLab}
            onRemove={removeLab}
            children={(l) => `${l.name}, ${l.duration}${l.preferred ? `, ${l.preferred}` : ""}`}
          />
          {error && <div className="text-red-300 mt-2 text-sm">{error}</div>}
          <div className="flex justify-between mt-6">
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