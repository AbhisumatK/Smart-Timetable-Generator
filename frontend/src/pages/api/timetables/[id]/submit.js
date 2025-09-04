import { readTimetables, writeTimetables } from "../../../../lib/timetableStore";

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const timetables = readTimetables();
  const index = timetables.findIndex(t => t.id === id);

  if (index === -1) return res.status(404).json({ error: "Timetable not found" });

  timetables[index].status = "pending";
  timetables[index].submittedAt = new Date().toISOString();

  writeTimetables(timetables);

  return res.status(200).json({ message: "Draft submitted for approval" });
}