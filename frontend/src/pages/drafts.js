import { useEffect, useState } from "react";
import { useScheduler } from "../context/SchedulerContext";
import TimetableTable from "../components/TimetableTable";

export default function DraftsPage() {
  const { currentUser } = useScheduler();
  const [drafts, setDrafts] = useState([]);
  const [expandedDrafts, setExpandedDrafts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchDrafts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/timetables?status=draft");
        if (!res.ok) throw new Error("Failed to fetch drafts");
        const data = await res.json();
        setDrafts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDrafts();
  }, [currentUser]);

  async function submitForApproval(id) {
    try {
      const res = await fetch(`/api/timetables/${id}/submit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      if (!res.ok) throw new Error("Failed to submit draft for approval");
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      alert("Draft submitted for approval.");
    } catch (err) {
      alert("Error submitting for approval: " + err.message);
    }
  }

  function toggleDraftView(id) {
    setExpandedDrafts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-500">
        Please log in to view your drafts.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-400">
        Loading drafts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-600">
        Error loading drafts: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Timetable Drafts</h1>
      {drafts.length === 0 ? (
        <p>No drafts available.</p>
      ) : (
        drafts.map((d) => (
          <div key={d.id} className="border rounded p-4 mb-6 bg-slate-800">
            <p>
              <strong>Draft ID:</strong> {d.id}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700 transition"
                onClick={() => toggleDraftView(d.id)}
              >
                {expandedDrafts.has(d.id) ? "Hide Timetable" : "View Timetable"}
              </button>
              <button
                className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700 transition"
                onClick={() => submitForApproval(d.id)}
              >
                Submit for Approval
              </button>
            </div>
            {expandedDrafts.has(d.id) && (
              <div className="mt-4">
                <TimetableTable timetable={d.timetable} timeSlots={d.timeSlots} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}