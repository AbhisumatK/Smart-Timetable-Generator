import { useScheduler } from "../context/SchedulerContext";
import { useTheme } from "../context/ThemeContext";
import InputList from "../components/InputList";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";

ClassroomsPage.auth = true;
export default function ClassroomsPage() {
  const { classrooms, setClassrooms } = useScheduler();
  const { isDark } = useTheme();
  const [error, setError] = useState("");
  const router = useRouter();

  function addRoom(name) {
    name = name.trim();
    if (!name) return false;
    setClassrooms([...classrooms, { name }]);
    return true;
  }

  function removeRoom(i) {
    setClassrooms(classrooms.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <Navbar />
      {/* Padding above the Stepper */}
      <div className="pt-8">
        <Stepper step={5} />
      </div>
      <div className="container max-w-xl mx-auto mt-8 p-6">
        <div className="card p-6">
          <InputList
            label="Enter Classroom Names"
            value={classrooms}
            setValue={setClassrooms}
            placeholder="e.g., Room 101"
            onAdd={addRoom}
            onRemove={removeRoom}
            children={(r) => r.name}
          />
          {error && <div className={`mt-2 text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>{error}</div>}
          <div className="flex justify-between mt-6">
            <button
              className="inline-flex items-center justify-center rounded-lg bg-violet-500/90 hover:bg-violet-400 text-white font-semibold px-4 py-2 transition-colors"
              onClick={() => router.push("/labs")}
            >
              Back
            </button>
            <button
              className="inline-flex items-center justify-center rounded-lg bg-cyan-400/90 hover:bg-cyan-300 text-slate-900 font-semibold px-4 py-2 transition-colors"
              onClick={() => router.push("/timetable")}
            >
              Generate Timetable
            </button>
          </div>
        </div>
      </div>
    </>
  );
}