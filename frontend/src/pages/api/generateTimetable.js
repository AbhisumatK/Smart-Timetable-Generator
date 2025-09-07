import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: "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" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { classrooms, timeSlots, labs, subjects, facultyAvailability, fixedClasses } = req.body;
  console.log(req.body);

  // Construct prompt with inputs (example)
  const prompt = `
    You are an expert and smart academic timetable scheduler AI.
    Using the inputs provided:

    - Classrooms available: ${classrooms.map(s => `${s.name}`).join(", ")}
    - Weekly Monday to Friday time slots: ${timeSlots.join(", ")}
    - Subjects with their duration in a single day and preferred time-slot (STRICTLY FOLLOWED AND SHOULD NOT EXCEED): ${labs.map(l => `Name: ${l.name}; Duration: ${l.duration}; Preferred Timeslot: ${l.preferred}`).join("; ")}
    - Subjects with their required number of weekly classes (STRICTLY FOLLOWED AND SHOULD NOT EXCEED): ${subjects.map(s => `${s.name}: ${s.weekly}`).join("; ")}
    - Faculty availability mapped to subjects: ${JSON.stringify(facultyAvailability)}
    - Fixed classes with assigned subject, time, day, room, and faculty: ${JSON.stringify(fixedClasses)}

    Generate **3 DIFFERENT and OPTIMIZED timetable options** as JSON objects, covering Monday through Friday.

    For each timetable FOLLOW THESE RULES AND STICK TO THESE RULES:

    - Assign each subject's classes to available time slots and classrooms.
    - Choose faculty based on the provided availability, ensuring no faculty clashes.
    - Respect fixed classes as immovable events.
    - Balance faculty workloads, minimize scheduling conflicts, and maximize room utilization.
    - Subjects must be scheduled **exactly the specified number of weekly classes**; do NOT exceed these limits under any circumstance.
    - If it is impossible to assign all classes without exceeding limits due to constraints, prioritize respecting limits and clearly note this limitation in the timetable option’s recommendation.
    - Provide the timetable with days and time slots as keys, mapping to classroom assignments indicating subject and faculty.
    - Include a "recommendation" field explaining the key advantages or trade-offs of this timetable option.
    - Every MENTIONED day must have classes, there may be gaps within timeslots

    Return ONLY a JSON array of these 3 timetable option objects with the following structure (USE THE ABOVE INPUT DATA ONLY):

    [
      {
        "timetable": {
          "Monday": {
            "09:00-10:00": { "INPUT_ROOM_NO": { "subject": "INPUT_SUBJECT_1", "faculty": "INPUT_FACULTY_1" } },
            "10:00-11:00": { "INPUT_ROOM_NO": { "subject": "INPUT_SUBJECT_2", "faculty": "INPUT_FACULTY_2, INPUT_FACULTY_3" } },
            "...": { "...": { "subject": "...", "faculty": "..." } }
          },
          "Tuesday": { "...": { "...": { "subject": "...", "faculty": "..." } } },
          "Wednesday": { "...": { "...": { "subject": "...", "faculty": "..." } } },
          "Thursday": { "...": { "...": { "subject": "...", "faculty": "..." } } },
          "Friday": { "...": { "...": { "subject": "...", "faculty": "..." } } }
        },
        "recommendation": "SUMMARIZE THE ALLOCATIONS AND TRADE-OFFS"
      },
      {...},
      {...}
    ]
    `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
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