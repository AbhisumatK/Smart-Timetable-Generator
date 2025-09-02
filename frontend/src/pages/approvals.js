import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TimetableTable from "../components/TimetableTable";
import { useScheduler } from "../context/SchedulerContext";

export default function ApprovalPage() {
  const { currentUser } = useScheduler();
  const [pendingTimetables, setPendingTimetables] = useState([]);

  useEffect(() => {
    async function fetchPending() {
      const res = await fetch("/api/timetables?status=pending");
      const data = await res.json();
      setPendingTimetables(data);
    }
    fetchPending();
  }, []);

  async function handleApprove(id) {
    await fetch(`/api/timetables/${id}/approve`, { method: "PUT" });
    setPendingTimetables((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleReject(id) {
    const comments = prompt("Reason for rejection?");
    if (!comments) return;
    await fetch(`/api/timetables/${id}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments }),
    });
    setPendingTimetables((prev) => prev.filter((d) => d.id !== id));
  }

  if (currentUser.role !== "approver") {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl mb-6">Pending Timetables for Approval</h1>
      {pendingTimetables.length === 0 && <p>No timetables pending approval.</p>}
      {pendingTimetables.map((dt) => (
        <div key={dt.id} className="mb-8 border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-3">Timetable ID: {dt.id}</h2>
          <TimetableTable timetable={dt.schedule} timeSlots={dt.timeSlots} />
          <div className="mt-4 space-x-4">
            <button
              onClick={() => handleApprove(dt.id)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(dt.id)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
          {dt.comments && (
            <p className="mt-3 text-red-700">Rejection Comments: {dt.comments}</p>
          )}
        </div>
      ))}
    </div>
  );
}