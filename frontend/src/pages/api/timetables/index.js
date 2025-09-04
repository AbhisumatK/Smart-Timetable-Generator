import { readTimetables, writeTimetables } from "../../../lib/timetableStore";

export default function handler(req, res) {
  if (req.method === "GET") {
    const { status } = req.query;
    const timetables = readTimetables();
    const filteredTimetables = status ? timetables.filter(t => t.status === status) : timetables;
    res.status(200).json(filteredTimetables);
  }
  else if (req.method === "POST") {
    let timetables = readTimetables();
    const draft = req.body;
    if (!draft.timetable) {
      return res.status(400).json({ error: "Timetable data required" });
    }
    draft.id = Date.now().toString();
    draft.status = draft.status || "pending";
    draft.createdAt = new Date().toISOString();
    timetables.push(draft);
    writeTimetables(timetables);
    res.status(201).json(draft);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}