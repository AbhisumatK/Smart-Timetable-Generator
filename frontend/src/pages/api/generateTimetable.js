import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { classrooms, timeSlots, labs, subjects, facultyAvailability, fixedClasses, lunchSlot } = req.body;
  console.log(req.body);

  function normalizeLunch(timetable) {
    try {
      if (!timetable || !Array.isArray(timeSlots) || !timeSlots.length || !lunchSlot || !timeSlots.includes(lunchSlot)) {
        return timetable;
      }
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const normalized = {};
      for (const day of days) {
        const dayMap = { ...(timetable?.[day] || {}) };
        // Remove any stray LUNCH entries in non-lunch slots
        for (const slotKey of Object.keys(dayMap)) {
          if (slotKey !== lunchSlot && dayMap[slotKey] && dayMap[slotKey].LUNCH) {
            const { LUNCH, ...rest } = dayMap[slotKey];
            dayMap[slotKey] = rest;
          }
        }
        // Collect existing classes in lunch slot to relocate
        const lunchCell = dayMap[lunchSlot];
        const toMove = [];
        if (lunchCell && typeof lunchCell === 'object') {
          for (const [room, info] of Object.entries(lunchCell)) {
            if (room === 'LUNCH') continue;
            toMove.push([room, info]);
          }
        }
        // Ensure lunch slot is properly marked
        dayMap[lunchSlot] = { LUNCH: { subject: "Lunch Break", faculty: "" } };
        // Relocate moved classes to nearest available slot on same day
        if (toMove.length) {
          const lunchIdx = timeSlots.indexOf(lunchSlot);
          const order = [];
          for (let i = lunchIdx + 1; i < timeSlots.length; i++) order.push(timeSlots[i]);
          for (let i = lunchIdx - 1; i >= 0; i--) order.push(timeSlots[i]);
          for (const [room, info] of toMove) {
            let placed = false;
            for (const target of order) {
              if (target === lunchSlot) continue;
              const cell = dayMap[target] || {};
              if (!cell[room]) {
                cell[room] = info;
                dayMap[target] = cell;
                placed = true;
                break;
              }
            }
            // If not placed anywhere, drop it (last resort)
          }
        }
        normalized[day] = dayMap;
      }
      return normalized;
    } catch {
      return timetable;
    }
  }

  // Construct refined prompt (no logic changes)
  const prompt = `
    You are an expert academic timetable planner. Produce STRICT JSON that is immediately display-ready and follows ALL constraints below.

    INPUTS:
    - Classrooms (use exactly and only these as room keys): [${classrooms.map(s => s.name).join(", ")}]
    - Ordered timeSlots for Monday–Friday (use EXACT strings as keys): [${timeSlots.join(", ")}]
    - Labs (each exactly once/week; duration = consecutive slot count; preferred = preferred start slot; if room provided, MUST use it): ${labs.map(l => `{name:"${l.name}", duration:"${l.duration}", preferred:"${l.preferred || ""}", room:"${l.room || ""}"}`).join(", ")}
    - Theory subjects (exact weekly occurrences): ${subjects.map(s => `{name:"${s.name}", weekly:${s.weekly}}`).join(", ")}
    - Faculty availability (subject -> allowed faculty with available Day -> [slots]): ${JSON.stringify(facultyAvailability)}
    - Fixed classes (immutable placements): ${JSON.stringify(fixedClasses)}
    - Lunch slot (if provided): ${JSON.stringify(lunchSlot)}

    HARD RULES (NO EXCEPTIONS):
    1) Time keys: Use provided timeSlots VERBATIM (HH:MM-HH:MM). Do not invent, merge, split, or reformat.
    2) Days: Top-level keys MUST be exactly Monday, Tuesday, Wednesday, Thursday, Friday.
    3) Rooms: Within a time slot, keys are ONLY classroom names from input or the special key "LUNCH".
    4) Lunch: If lunchSlot exists, set that slot on ALL days to { "LUNCH": { "subject": "Lunch Break", "faculty": "" } } and schedule nothing else in that slot. If no lunchSlot, do not invent lunch.
    5) Labs: Schedule each exactly once per week; occupy consecutive slots on the same day; never split; honor preferred and fixed room when possible without violating constraints.
    6) Theory: Schedule each subject exactly weekly times; spread across days; aim ≤ 2 periods/day/subject when feasible.
    7) Conflicts: Never double-book a room or a faculty; faculty must be chosen from the subject’s facultyAvailability for that exact day and slot.
    8) Fixed classes: Place exactly as specified (same day, slot, room, subject, faculty).

    OUTPUT (STRICT SCHEMA – THREE OPTIONS):
    {
      "options": [
        {
          "timetable": {
            "Monday": {
              "${timeSlots[0] || "09:00-10:00"}": {
                "${(classrooms[0] && classrooms[0].name) || "ROOM-101"}": { "subject": "SUBJECT_NAME", "faculty": "FACULTY_NAME" }
              }
            },
            "Tuesday": {}, "Wednesday": {}, "Thursday": {}, "Friday": {}
          },
          "recommendation": "Plain-language benefits/trade-offs"
        },
        { "timetable": {"Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday": {}, "Friday": {}}, "recommendation": "..." },
        { "timetable": {"Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday": {}, "Friday": {}}, "recommendation": "..." }
      ]
    }

    CONTENT & QUALITY RULES:
    - Omit empty time slots entirely (except include lunchSlot if provided).
    - Every scheduled class must have non-empty subject and faculty.
    - Never use a time slot not in the provided list; never use a room not in the provided list.
    - Recommendation: friendly, 1–2 sentences, ≤ 30 words.
    - Prefer balanced distribution and minimal conflicts. If a perfect schedule is impossible, still return the best-feasible option that obeys all hard rules.

    Generate THREE clearly distinct options:
    - Option A: labs grouped on alternating days (each lab consecutive)
    - Option B: evenly balanced across the week
    - Option C: afternoon-weighted (lighter mornings)

    Return ONLY one JSON object with an "options" array of length 3. No extra text.
    `;

  try {
    const response = await groq.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        { role: "system", content: "You are a strict JSON generator. Always return a single valid JSON object matching the requested schema. No extra text." },
        { role: "user", content: prompt }
      ],
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
      stop: null
    });

    const content = response.choices[0]?.message?.content || '{}';
    let parsed = {};
    try { parsed = JSON.parse(content); } catch {}

    let options = Array.isArray(parsed.options) ? parsed.options : [];
    options = options
      .map((o) => (o && o.timetable ? o : { timetable: o || {}, recommendation: "" }))
      .map((o) => ({ timetable: normalizeLunch(o.timetable || {}), recommendation: o.recommendation || "" }));

    // Return only a single option for now
    return res.status(200).json({ timetableOptions: options.slice(0, 1) });
  } catch (error) {
    console.error("Groq API error:", error);
    return res.status(200).json({ timetableOptions: [] });
  }
}