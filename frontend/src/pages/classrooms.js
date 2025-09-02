import { useScheduler } from "../context/SchedulerContext";
import InputList from "../components/InputList";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ClassroomsPage() {
  const { classrooms, setClassrooms } = useScheduler();
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
      <Stepper step={4} />
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <InputList
          label="Enter Classroom Names"
          value={classrooms}
          setValue={setClassrooms}
          placeholder="e.g., Room 101"
          onAdd={addRoom}
          onRemove={removeRoom}
          children={(r) => r.name}
        />
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex justify-between mt-6">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => router.push("/labs")}>Back</button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => router.push("/timetable")}>
            Generate Timetable
          </button>
        </div>
      </div>
    </>
  );
}