import { useEffect, useState } from "react";
import { useScheduler } from "../context/SchedulerContext";

export default function DraftsPage() {
  const { currentUser } = useScheduler();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    async function fetchDrafts() {
      const res = await fetch("/api/timetables?status=draft");
      const data = await res.json();
      setDrafts(data);
    }
    fetchDrafts();
  }, []);

  async function submitForApproval(id) {
    await fetch(`/api/timetables/${id}/submit`, { method: "PUT" });
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="mb-6 text-3xl">Your Timetable Drafts</h1>
      {drafts.length === 0 && <p>No drafts available.</p>}
      {drafts.map((d) => (
        <div key={d.id} className="border rounded p-4 mb-6">
          <p><strong>Draft ID:</strong> {d.id}</p>
          <button
            className="bg-blue-600 px-4 py-2 text-white rounded mt-3"
            onClick={() => submitForApproval(d.id)}
          >
            Submit for Approval
          </button>
        </div>
      ))}
    </div>
  );
}