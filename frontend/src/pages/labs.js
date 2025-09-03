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
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <InputList
          label="Enter Lab Classes"
          value={labs}
          setValue={setLabs}
          placeholder="e.g., OOPS Lab,2,13:00-14:00"
          onAdd={addLab}
          onRemove={removeLab}
          children={(l) => `${l.name}, ${l.duration}${l.preferred ? `, ${l.preferred}` : ""}`}
        />
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex justify-between mt-6">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => router.push("/fixedClasses")}>Back</button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => router.push("/classrooms")}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}