import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: "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" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { classrooms, timeSlots, subjects, facultyAvailability, fixedClasses } = req.body;
  console.log(req.body);

  // Construct prompt with inputs (example)
  const prompt = `
    You are an expert and smart academic timetable scheduler AI.
    Using the inputs provided:

    - Classrooms available: ${classrooms.join(", ")}
    - Weekly Monday to Friday time slots: ${timeSlots.join(", ")}
    - Subjects with their required number of weekly classes: ${subjects.map(s => `${s.name}: ${s.weekly}`).join("; ")}
    - Faculty availability mapped to subjects: ${JSON.stringify(facultyAvailability)}
    - Fixed classes with assigned subject, time, day, room, and faculty: ${JSON.stringify(fixedClasses)}

    Generate **3 distinct and optimized timetable options** as JSON objects, covering Monday through Friday.  
    For each timetable:

    - Assign each subject's classes to available time slots and classrooms.
    - Choose faculty based on the provided availability, ensuring no faculty clashes.
    - Respect fixed classes as immovable events.
    - Balance faculty workloads, minimize scheduling conflicts, and maximize room utilization.
    - Provide the timetable with days and time slots as keys, mapping to classroom assignments indicating subject and faculty.
    - Include a "recommendation" field explaining the key advantages or trade-offs of this timetable option.

    Return ONLY a JSON array of these 3 timetable option objects.
    `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "gemma2-9b-it",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
      stop: null
    });

    const timetableOptions = chatCompletion.choices[0].message.content;
    console.log(timetableOptions)

    return res.status(200).json({ timetableOptions });
  } catch (error) {
    console.error("Groq API error:", error);
    return res.status(500).json({ error: "Failed to generate timetable" });
  }
}