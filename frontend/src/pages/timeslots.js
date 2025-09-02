import { useScheduler } from "../context/SchedulerContext";
import InputList from "../components/InputList";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";

export default function TimeSlotsPage() {
  const { timeSlots, setTimeSlots } = useScheduler();
  const [error, setError] = useState("");
  const router = useRouter();

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
    setTimeSlots(timeSlots.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <Navbar />
      <Stepper step={1} />
      <div className="max-w-xl mx-auto p-6 mt-8 bg-white rounded shadow">
        <InputList
          label="Enter Time Slots"
          value={timeSlots}
          setValue={setTimeSlots}
          placeholder="e.g., 09:00-10:00"
          onAdd={addSlot}
          onRemove={removeSlot}
        />
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex justify-between mt-6">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => router.push("/")}>Back</button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={timeSlots.length === 0}
            onClick={() => router.push("/subjects")}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}