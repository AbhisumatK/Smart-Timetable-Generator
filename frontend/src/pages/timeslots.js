import { useScheduler } from "../context/SchedulerContext";
import InputList from "../components/InputList";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

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
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center mb-8">
            <h2 className="section-header">Time Slots Configuration</h2>
            <p className="section-subtitle">
              Define your available time slots in HH:MM-HH:MM format
            </p>
          </div>
          
          <div className="card max-w-2xl mx-auto">
            <InputList
              label="Enter Time Slots"
              value={timeSlots}
              setValue={setTimeSlots}
              placeholder="e.g., 09:00-10:00"
              onAdd={addSlot}
              onRemove={removeSlot}
            />
            {error && <div className="text-red-400 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">{error}</div>}
            
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
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