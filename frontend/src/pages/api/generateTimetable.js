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

  // Construct prompt with inputs (example)
  const prompt = `
    You are an expert academic timetable scheduler AI. Build valid, display-ready timetables that STRICTLY follow the inputs.

    INPUTS:
    - Classrooms (use exactly these as room keys; do not invent): [${classrooms.map(s => s.name).join(", ")}]
    - Ordered time slots for Monday–Friday (use EXACTLY as keys; do not invent/modify): [${timeSlots.join(", ")}]
    - Lab subjects (schedule once per week; duration is consecutive count of provided slots; preferred slot indicates preferred start or period to place if possible; if a room is provided, that room MUST be used): ${labs.map(l => `{name:"${l.name}", duration:"${l.duration}", preferred:"${l.preferred || ""}", room:"${l.room || ""}"}`).join(", ")}
    - Theory subjects with required weekly classes (must match exactly; do not exceed): ${subjects.map(s => `{name:"${s.name}", weekly:${s.weekly}}`).join(", ")}
    - Faculty availability map (subject -> allowed faculty and their available days/slots): ${JSON.stringify(facultyAvailability)}
    - Fixed classes (immutable; must appear exactly as specified): ${JSON.stringify(fixedClasses)}
    - Lunch slot (if provided, block this slot on all days with a LUNCH marker and no classes): ${JSON.stringify(lunchSlot)}

    HARD RULES (MUST FOLLOW):
    1) TIME FORMAT AND KEYS:
       - Use the provided timeSlots VERBATIM as the only keys for time on each day.
       - Do NOT change formatting; keep strictly as HH:MM-HH:MM (e.g., 09:00-10:00) exactly as given.
       - Do NOT add, merge, split, or invent any time slots.
    2) DAYS:
       - Include exactly these days as top-level keys: Monday, Tuesday, Wednesday, Thursday, Friday.
       - Each day may include ONLY NON-EMPTY timeSlots (omit empty ones entirely) EXCEPT the lunchSlot which must be present if provided.
    3) ROOMS:
       - Inside each time slot, keys must be classroom names from the provided classrooms or the special key "LUNCH" only.
       - Do NOT create unknown rooms.
       - If a lab specifies a room, schedule that lab ONLY in that exact room.
    4) LUNCH:
       - If lunchSlot is provided, mark that slot on ALL days with a single entry: "LUNCH": { "subject": "Lunch Break", "faculty": "" } and schedule no classes in that slot.
       - If lunchSlot is not provided, do NOT invent any lunch period.
    5) LABS:
       - Each lab listed must be scheduled EXACTLY ONCE per week.
       - Labs must occupy consecutive timeSlots on the SAME day according to their duration (duration is number of slots; if given in hours, map to the equivalent number of adjacent slots).
       - Do NOT split a lab across non-consecutive slots or days.
       - Try to honor preferred when possible without violating constraints.
       - If a lab has a specified room (e.g., a lab room number), that lab MUST be placed in that exact room. Do not assign it to any other room.
    6) THEORY CLASSES:
       - Schedule exactly the required weekly counts per subject; do not exceed or fall short.
       - Spread classes across multiple days. As a guideline, cap to at most 2 periods per subject per day unless impossible due to constraints.
    7) FACULTY & ROOM CLASHES:
       - Do not assign a faculty member or a room to two different classes at the same time.
       - Respect facultyAvailability when choosing faculty for subjects.
    8) FIXED CLASSES:
       - Place all fixed classes exactly as specified (same day, slot, room, subject, faculty). Do not overlap them.
    9) OUTPUT SCHEMA (STRICT; RETURN THREE OPTIONS):
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
             "recommendation": "Plain-language summary of benefits and trade-offs"
           },
           { "timetable": {"Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday": {}, "Friday": {}}, "recommendation": "..." },
           { "timetable": {"Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday": {}, "Friday": {}}, "recommendation": "..." }
         ]
       }
    10) CONTENT RULES:
       - OMIT empty time slots entirely to keep the JSON small. Include only slots that have at least one room OR the LUNCH marker.
       - For each scheduled class, provide both subject and faculty as non-empty strings.
       - Never place any entry for time slots that are not in the provided list.
       - Recommendation must be plain-language, non-technical, and at most 30 words.
       - Avoid metrics/jargon. Describe the schedule style and human impact (e.g., "lighter afternoons", "evenly spread across the week", "labs kept together").

    Generate THREE clearly different timetable options:
    - Option A: different labs on alternating days (same lab consecutive)
    - Option B: balanced across the week with steady daily load
    - Option C: afternoon-weighted with slower mornings
    For each option, write a friendly 1–2 sentence recommendation explaining benefits and trade-offs for students and faculty in everyday terms. No numbers or technical terms.
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