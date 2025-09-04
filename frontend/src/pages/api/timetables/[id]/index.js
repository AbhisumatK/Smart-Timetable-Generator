import { readTimetables, writeTimetables } from "../../../../lib/timetableStore";

export default function handler(req, res) {
  const { id } = req.query;
  let timetables = readTimetables();
  const index = timetables.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: "Timetable not found" });

  if (req.method === "PUT") {
    const { action, comments, approver } = req.body;
    if (!action || (action !== "approve" && action !== "reject")) {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (action === "approve") {
      timetables[index] = {
        ...timetables[index],
        status: "approved",
        approvedBy: approver || "unknown",
        approvedAt: new Date().toISOString(),
        comments: "",
      };
      writeTimetables(timetables);
      return res.status(200).json({ message: "Timetable approved" });
    }

    if (action === "reject") {
      if (!comments || comments.trim() === "") {
        return res.status(400).json({ error: "Comments required for rejection" });
      }
      timetables[index] = {
        ...timetables[index],
        status: "rejected",
        approvedBy: approver || "unknown",
        approvedAt: new Date().toISOString(),
        comments,
      };
      writeTimetables(timetables);
      return res.status(200).json({ message: "Timetable rejected" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}