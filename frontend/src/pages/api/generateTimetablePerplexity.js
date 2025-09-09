// pages/api/build-timetable.js
// Replaces Groq with Perplexity Pro (OpenAI-compatible) chat completions.

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  
    function normalizeFixedClasses(timetable) {
      try {
        if (!Array.isArray(fixedClasses) || fixedClasses.length === 0) return timetable;
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const result = { ...(timetable || {}) };
        for (const fc of fixedClasses) {
          const day = fc?.day;
          const time = fc?.time;
          const room = fc?.room;
          const subject = (fc?.subject || "").trim();
          const faculty = (fc?.faculty || "").trim();
          if (!day || !time || !room || !subject) continue;
          if (!days.includes(day)) continue;
          if (Array.isArray(timeSlots) && timeSlots.length && !timeSlots.includes(time)) continue;
          if (lunchSlot && time === lunchSlot) {
            // Lunch slot is exclusive; skip overlaying fixed class here
            continue;
          }
          const dayMap = { ...(result[day] || {}) };
          const slotMap = { ...(dayMap[time] || {}) };
          slotMap[room] = { subject, faculty };
          dayMap[time] = slotMap;
          result[day] = dayMap;
        }
        return result;
      } catch {
        return timetable;
      }
    }
  
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
      You are an expert academic timetable planner. Produce STRICT JSON that is immediately display-ready and follows ALL constraints below.

      INPUTS:
      - Classrooms (use exactly and only these as room keys): [${Array.isArray(classrooms) ? classrooms.map(s => s.name).join(", ") : ""}]
      - Ordered timeSlots for Monday–Friday (use EXACT strings as keys): [${Array.isArray(timeSlots) ? timeSlots.join(", ") : ""}]
      - Labs (each exactly once/week; duration = consecutive slot count; preferred = preferred start slot; if room provided, MUST use it): ${Array.isArray(labs) ? labs.map(l => `{name:"${l.name}", duration:"${l.duration}", preferred:"${l.preferred || ""}", room:"${l.room || ""}"}`).join(", ") : ""}
      - Theory subjects (exact weekly occurrences): ${Array.isArray(subjects) ? subjects.map(s => `{name:"${s.name}", weekly:${s.weekly}}`).join(", ") : ""}
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
                "${Array.isArray(timeSlots) && timeSlots[0] ? timeSlots[0] : "09:00-10:00"}": {
                  "${Array.isArray(classrooms) && classrooms[0] && classrooms[0].name ? classrooms[0].name : "ROOM-101"}": { "subject": "SUBJECT_NAME", "faculty": "FACULTY_NAME" }
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
        .map((o) => ({ timetable: normalizeLunch(o.timetable || {}), recommendation: o.recommendation || "" }))
        .map((o) => ({ timetable: normalizeFixedClasses(o.timetable || {}), recommendation: o.recommendation }));
  
      while (options.length < 3 && options.length > 0) {
        options.push({ timetable: options[0].timetable, recommendation: options[0].recommendation });
      }
  
      return res.status(200).json({ timetableOptions: options.slice(0, 3) });
    } catch (error) {
      console.error("Perplexity API call failed:", error);
      return res.status(200).json({ timetableOptions: [] });
    }
  }  