import { TimetableGA } from "../../lib/timetableGA";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { classrooms, timeSlots, subjects, facultyAvailability, fixedClasses } = req.body;

    // Validate input (basic)
    if (!classrooms || !timeSlots || !subjects) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Create GA generator instance
    const generator = new TimetableGA({
      classrooms,
      timeSlots,
      subjects,
      facultyAvailability: facultyAvailability || {},
      fixedClasses: fixedClasses || [],
      populationSize: 30,
      generations: 50,
    });

    // Run GA to get timetable options
    const timetableOptions = generator.run();

    return res.status(200).json({ timetableOptions });
  } catch (error) {
    console.error("Error generating timetable:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}