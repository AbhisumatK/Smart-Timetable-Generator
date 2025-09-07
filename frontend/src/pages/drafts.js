import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useScheduler } from "../context/SchedulerContext";
import TimetableTable from "../components/TimetableTable";

DraftsPage.auth = true;
export default function DraftsPage() {
  const router = useRouter();
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
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-cyan-300 font-semibold mt-4 text-lg">Loading drafts...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
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
      <h1 className="mb-6 text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">Your Timetable Drafts</h1>
      {drafts.length === 0 ? (
        <p>No drafts available.</p>
      ) : (
        drafts.map((d) => (
          <div key={d.id} className="border border-cyan-500/20 rounded-xl p-6 mb-6 bg-gradient-to-br from-slate-800/50 via-slate-700/40 to-slate-800/50 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300">
            <p className="text-cyan-200 font-semibold mb-2">
              <span className="text-cyan-400">Draft ID:</span> {d.id}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-400/30"
                onClick={() => toggleDraftView(d.id)}
              >
                {expandedDrafts.has(d.id) ? "Hide Timetable" : "View Timetable"}
              </button>
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 border border-green-400/30"
                onClick={() => submitForApproval(d.id)}
              >
                Submit for Approval
              </button>
              <button
                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 border border-red-400/30"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/timetables/${d.id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete draft');
                    setDrafts(prev => prev.filter(x => x.id !== d.id));
                  } catch (err) {
                    alert('Error deleting draft: ' + err.message);
                  }
                }}
              >
                Delete
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
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => router.back()}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 text-lg font-bold shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 border border-cyan-400/30 pulse-glow"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
}