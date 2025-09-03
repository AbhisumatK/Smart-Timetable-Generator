import { useScheduler } from "../context/SchedulerContext";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SubjectsPage() {
  const { subjects, setSubjects, facultyAssignments, setFacultyAssignments } = useScheduler();
  const [error, setError] = useState("");
  const router = useRouter();

  // Local state for new inputs
  const [nameInput, setNameInput] = useState("");
  const [weeklyInput, setWeeklyInput] = useState("");
  const [facultyInput, setFacultyInput] = useState("");

  function addSubject() {
    const name = nameInput.trim();
    const weekly = parseInt(weeklyInput);
    if (!name || !weekly || weekly <= 0) {
      setError("Please enter valid Subject Name and Weekly Classes.");
      return;
    }
    const faculties = facultyInput.split(",").map(f => f.trim()).filter(f => f); // array of faculty

    // Prevent duplicate subject
    if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setError("Subject already added.");
      return;
    }

    setSubjects([...subjects, { name, weekly }]);
    setFacultyAssignments({ ...facultyAssignments, [name]: faculties });

    // Reset inputs and error
    setNameInput("");
    setWeeklyInput("");
    setFacultyInput("");
    setError("");
  }

  function removeSubject(i) {
    const subToRemove = subjects[i];
    setSubjects(subjects.filter((_, idx) => idx !== i));
    // Remove faculty entry as well
    const updatedFac = { ...facultyAssignments };
    delete updatedFac[subToRemove.name];
    setFacultyAssignments(updatedFac);
  }

  return (
    <>
      <Navbar />
      <Stepper step={2} />
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <div className="mb-4 space-y-2">
          <input
            placeholder="Subject Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            placeholder="Weekly Classes (e.g., 4)"
            value={weeklyInput}
            onChange={(e) => setWeeklyInput(e.target.value)}
            type="number"
            min={1}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            placeholder="Faculty (comma separated)"
            value={facultyInput}
            onChange={(e) => setFacultyInput(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            onClick={addSubject}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full"
          >
            Add Subject
          </button>
          {error && <p className="text-red-600 mt-1">{error}</p>}
        </div>

        {subjects.length > 0 && (
          <ul className="space-y-2 max-h-64 overflow-auto">
            {subjects.map((s, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <div>
                  <strong>{s.name}</strong>, {s.weekly} classes<br />
                  <small>Faculty: {(facultyAssignments[s.name] || []).join(", ") || "None"}</small>
                </div>
                <button
                  onClick={() => removeSubject(i)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Remove subject ${s.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => router.push("/timeslots")}
          >
            Back
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={subjects.length === 0}
            onClick={() => router.push("/fixedClasses")}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}