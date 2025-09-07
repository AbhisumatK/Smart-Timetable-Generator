import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TimetableTable from "../components/TimetableTable";
import { useScheduler } from "../context/SchedulerContext";

ApprovalPage.auth = true;
export default function ApprovalPage() {
  const { currentUser } = useScheduler();
  const [pendingTimetables, setPendingTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchPending() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/timetables?status=pending");
        if (!res.ok) throw new Error("Failed to fetch pending timetables");
        const data = await res.json();
        setPendingTimetables(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPending();
  }, [currentUser]);

  async function handleApprove(id) {
    try {
      const res = await fetch(`/api/timetables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve timetable");
      setPendingTimetables((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Error approving timetable: " + err.message);
    }
  }

  async function handleReject(id) {
    const comments = prompt("Please enter reason for rejection:");
    if (!comments) return;
    try {
      const res = await fetch(`/api/timetables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", comments }),
      });
      if (!res.ok) throw new Error("Failed to reject timetable");
      setPendingTimetables((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Error rejecting timetable: " + err.message);
    }
  }

  if (!currentUser || currentUser.role !== "approver") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-lg font-medium text-red-600">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-400">
        Loading pending timetables...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Pending Timetables for Approval</h1>

        {pendingTimetables.length === 0 ? (
          <p className="text-gray-400 text-center">No timetables pending approval.</p>
        ) : (
          pendingTimetables.map((dt) => (
            <div
              key={dt.id}
              className="mb-8 border border-gray-700 rounded-lg p-6 shadow-lg bg-slate-900"
            >
              <h2 className="text-xl font-semibold mb-4">Timetable ID: {dt.id}</h2>
              <TimetableTable timetable={dt.timetable || dt.schedule} timeSlots={dt.timeSlots} />
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => handleApprove(dt.id)}
                  className="bg-green-600 hover:bg-green-700 transition px-5 py-2 rounded-md text-white font-semibold"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(dt.id)}
                  className="bg-red-600 hover:bg-red-700 transition px-5 py-2 rounded-md text-white font-semibold"
                >
                  Reject
                </button>
              </div>
              {dt.comments && (
                <p className="mt-4 text-red-400 italic border-l-4 border-red-500 pl-4">
                  <strong>Rejection Comments:</strong> {dt.comments}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}