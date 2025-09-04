import { useState } from "react";
import { useScheduler } from "../context/SchedulerContext";
import Stepper from "../components/Stepper";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function FixedClassesPage() {
  const { fixedClasses, setFixedClasses, classrooms, timeSlots } = useScheduler();
  const [day, setDay] = useState(daysOfWeek[0]);
  const [time, setTime] = useState(timeSlots.length > 0 ? timeSlots[0] : "");
  const [room, setRoom] = useState(classrooms.length > 0 ? classrooms[0] : "");
  const [subject, setSubject] = useState("");
  const [faculty, setFaculty] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function addFixedClass() {
    if (!subject.trim()) {
      setError("Subject/Event name is required");
      return;
    }
    if (!day || !time || !room) {
      setError("Day, Time, and Room must be selected");
      return;
    }
    setError("");
    const newEntry = { day, time, room, subject: subject.trim(), faculty: faculty.trim() };
    setFixedClasses([...fixedClasses, newEntry]);
    // Reset inputs if desired
    setSubject("");
    setFaculty("");
  }

  function removeFixedClass(index) {
    setFixedClasses(fixedClasses.filter((_, i) => i !== index));
  }

  return (
    <>
      <Navbar />
      <Stepper step={3} />
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Fixed Classes / Events</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="space-y-3 mb-4">
          <div>
            <label>Day:</label>
            <select value={day} onChange={e => setDay(e.target.value)} className="ml-2 p-1 border rounded">
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label>Time Slot:</label>
            <select value={time} onChange={e => setTime(e.target.value)} className="ml-2 p-1 border rounded">
              {timeSlots.map(ts => <option key={ts} value={ts}>{ts}</option>)}
            </select>
          </div>

          <div>
            <label>Room:</label>
            <select value={room} onChange={e => setRoom(e.target.value)} className="ml-2 p-1 border rounded">
              {classrooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label>Subject / Event Name:</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Seminar on AI"
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div>
            <label>Faculty (optional):</label>
            <input
              type="text"
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              placeholder="e.g. Prof. Smith"
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <button onClick={addFixedClass} className="bg-blue-600 text-white px-4 py-2 rounded mt-3">
            Add Fixed Class
          </button>
        </div>

        {fixedClasses.length > 0 && (
          <>
            <h3 className="mb-3 font-semibold">Existing Fixed Classes</h3>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {fixedClasses.map((fc, idx) => (
                <li key={idx} className="flex justify-between bg-gray-100 p-2 rounded">
                  <span>
                    <strong>{fc.subject}</strong> on {fc.day} at {fc.time} in {fc.room}
                    {fc.faculty && `, Faculty: ${fc.faculty}`}
                  </span>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => removeFixedClass(idx)}
                    aria-label={`Remove fixed class ${fc.subject}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex justify-between mt-6">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => router.push("/subjects")}>
            Back
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => router.push("/labs")}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}