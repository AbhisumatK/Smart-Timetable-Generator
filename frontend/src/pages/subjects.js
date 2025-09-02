import { useScheduler } from "../context/SchedulerContext";
import InputList from "../components/InputList";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SubjectsPage() {
  const { subjects, setSubjects } = useScheduler();
  const [error, setError] = useState("");
  const router = useRouter();

  function addSubject(entry) {
    const [name, weeklyRaw] = entry.split(",").map(e => e.trim());
    const weekly = parseInt(weeklyRaw);
    if (!name || !weekly || weekly <= 0) {
      setError("Format: SubjectName,WeeklyClasses (e.g., Math,4)");
      return false;
    }
    setError("");
    setSubjects([...subjects, { name, weekly }]);
    return true;
  }

  function removeSubject(i) {
    setSubjects(subjects.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <Navbar />
      <Stepper step={2} />
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <InputList
          label="Enter Subjects and Weekly Class Count"
          value={subjects}
          setValue={setSubjects}
          placeholder="e.g., Math,4"
          onAdd={addSubject}
          onRemove={removeSubject}
          children={(s) => `${s.name}, ${s.weekly}`}
        />
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex justify-between mt-6">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => router.push("/timeslots")}>Back</button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={subjects.length === 0}
            onClick={() => router.push("/labs")}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}