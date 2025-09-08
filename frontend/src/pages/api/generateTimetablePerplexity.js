// pages/api/build-timetable.js
// Replaces Groq with Perplexity Pro (OpenAI-compatible) chat completions.

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  
    const { classrooms, timeSlots, labs, subjects, facultyAvailability, fixedClasses, lunchSlot } = req.body;
    // Optional: cleaner server logs
    // console.log('req.body =\n' + JSON.stringify(req.body, null, 2));
  
    function normalizeLunch(timetable) {
      try {
        if (!timetable || !Array.isArray(timeSlots) || !timeSlots.length || !lunchSlot || !timeSlots.includes(lunchSlot)) {
          return timetable;
        }
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const normalized = {};
        for (const day of days) {
          const dayMap = { ...(timetable?.[day] || {}) };
          for (const slotKey of Object.keys(dayMap)) {
            if (slotKey !== lunchSlot && dayMap[slotKey] && dayMap[slotKey].LUNCH) {
              const { LUNCH, ...rest } = dayMap[slotKey];
              dayMap[slotKey] = rest;
            }
          }
          const lunchCell = dayMap[lunchSlot];
          const toMove = [];
          if (lunchCell && typeof lunchCell === 'object') {
            for (const [room, info] of Object.entries(lunchCell)) {
              if (room === 'LUNCH') continue;
              toMove.push([room, info]);
            }
          }
          dayMap[lunchSlot] = { LUNCH: { subject: "Lunch Break", faculty: "" } };
          if (toMove.length) {
            const lunchIdx = timeSlots.indexOf(lunchSlot);
            const order = [];
            for (let i = lunchIdx + 1; i < timeSlots.length; i++) order.push(timeSlots[i]);
            for (let i = lunchIdx - 1; i >= 0; i--) order.push(timeSlots[i]);
            for (const [room, info] of toMove) {
              for (const target of order) {
                if (target === lunchSlot) continue;
                const cell = dayMap[target] || {};
                if (!cell[room]) {
                  cell[room] = info;
                  dayMap[target] = cell;
                  break;
                }
              }
            }
          }
          normalized[day] = dayMap;
        }
        return normalized;
      } catch {
        return timetable;
      }
    }
  
    const prompt = `
      You are an expert academic timetable scheduler AI. Build valid, display-ready timetables that STRICTLY follow the inputs.
  
      INPUTS:
      - Classrooms (use exactly these as room keys; do not invent): [${Array.isArray(classrooms) ? classrooms.map(s => s.name).join(", ") : ""}]
      - Ordered time slots for Monday–Friday (use EXACTLY as keys; do not invent/modify): [${Array.isArray(timeSlots) ? timeSlots.join(", ") : ""}]
      - Lab subjects (schedule once per week; duration is consecutive count of provided slots; preferred slot indicates preferred start or period to place if possible; if a room is provided, that room MUST be used): ${Array.isArray(labs) ? labs.map(l => `{name:"${l.name}", duration:"${l.duration}", preferred:"${l.preferred || ""}", room:"${l.room || ""}"}`).join(", ") : ""}
      - Theory subjects with required weekly classes (must match exactly; do not exceed): ${Array.isArray(subjects) ? subjects.map(s => `{name:"${s.name}", weekly:${s.weekly}}`).join(", ") : ""}
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
         - Labs must occupy consecutive timeSlots on the SAME day according to their duration.
         - Do NOT split a lab across non-consecutive slots or days.
         - Try to honor preferred when possible without violating constraints.
         - If a lab has a specified room, that lab MUST be placed in that exact room.
      6) THEORY CLASSES:
         - Schedule exactly the required weekly counts per subject; do not exceed or fall short.
         - Spread classes across multiple days; cap ~2 periods per subject per day unless impossible.
      7) FACULTY & ROOM CLASHES:
         - No faculty or room may have two different classes at the same time.
         - Respect facultyAvailability when choosing faculty for subjects.
      8) FIXED CLASSES:
         - Place all fixed classes exactly as specified (same day, slot, room, subject, faculty).
      9) OUTPUT SCHEMA (STRICT; RETURN THREE OPTIONS):
         {
           "options": [
             {
               "timetable": {
                 "Monday": {
                   "${Array.isArray(timeSlots) && timeSlots[0] ? timeSlots[0] : "09:00-10:00"}": {
                     "${Array.isArray(classrooms) && classrooms[0] && classrooms[0].name ? classrooms[0].name : "ROOM-101"}": { "subject": "SUBJECT_NAME", "faculty": "FACULTY_NAME" }
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
         - OMIT empty time slots except the lunchSlot.
         - For each scheduled class, include non-empty subject and faculty.
         - Never use time slots not in the provided list.
         - Recommendation must be friendly, 1–2 sentences, at most 30 words.
  
      Generate THREE clearly different timetable options:
      - Option A: different labs on alternating days (same lab consecutive)
      - Option B: balanced across the week with steady daily load
      - Option C: afternoon-weighted with slower mornings
      Return ONLY one JSON object with an "options" array of length 3. No extra text.
    `;
  
    try {
      const resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: "You are a strict JSON generator. Always return a single valid JSON object matching the requested schema. No extra text." },
            { role: "user", content: prompt }
          ],
          temperature: 1,
          top_p: 1,
          max_tokens: 4096,
          stream: false
        })
      });
  
      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        console.error("Perplexity API error:", resp.status, errText);
        return res.status(200).json({ timetableOptions: [] });
      }
  
      const data = await resp.json();
      const contents = data?.choices?.[0]?.message?.content || "{}";
  
      let parsed = {};
      try { parsed = JSON.parse(contents); } catch { parsed = {}; }
  
      let options = Array.isArray(parsed.options) ? parsed.options : [];
      options = options
        .map((o) => (o && o.timetable ? o : { timetable: o || {}, recommendation: "" }))
        .map((o) => ({ timetable: normalizeLunch(o.timetable || {}), recommendation: o.recommendation || "" }));
  
      while (options.length < 3 && options.length > 0) {
        options.push({ timetable: options[0].timetable, recommendation: options[0].recommendation });
      }
  
      return res.status(200).json({ timetableOptions: options.slice(0, 3) });
    } catch (error) {
      console.error("Perplexity API call failed:", error);
      return res.status(200).json({ timetableOptions: [] });
    }
  }  