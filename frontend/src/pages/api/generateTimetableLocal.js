// pages/api/build-timetable.js (Next.js API Route)
// Deterministic timetable builder replacing AI generation.
// Generates three options (A/B/C) per the original schema and rules.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { classrooms, timeSlots, labs, subjects, facultyAvailability, fixedClasses, lunchSlot } = req.body;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Defensive defaults
  const roomNames = Array.isArray(classrooms) ? classrooms.map(r => r?.name).filter(Boolean) : [];
  const slots = Array.isArray(timeSlots) ? timeSlots.filter(Boolean) : [];
  const labsIn = Array.isArray(labs) ? labs : [];
  const subjectsIn = Array.isArray(subjects) ? subjects : [];
  const fixedIn = Array.isArray(fixedClasses) ? fixedClasses : [];
  const facAvail = facultyAvailability && typeof facultyAvailability === "object" ? facultyAvailability : {};

  // Normalize lunch in a timetable object while preserving only non-empty time slots,
  // but forcing the lunch slot to exist on all days.
  function normalizeLunch(timetable) {
    try {
      if (!timetable || !Array.isArray(slots) || !slots.length || !lunchSlot || !slots.includes(lunchSlot)) {
        return timetable;
      }
      const normalized = {};
      for (const day of days) {
        const dayMap = { ...(timetable?.[day] || {}) };
        // Remove stray LUNCH entries not in lunchSlot
        for (const slotKey of Object.keys(dayMap)) {
          if (slotKey !== lunchSlot && dayMap[slotKey] && dayMap[slotKey].LUNCH) {
            const { LUNCH, ...rest } = dayMap[slotKey];
            dayMap[slotKey] = rest;
            if (Object.keys(dayMap[slotKey]).length === 0) delete dayMap[slotKey];
          }
        }
        // Collect existing classes in lunch slot to relocate
        const toMove = [];
        const lunchCell = dayMap[lunchSlot];
        if (lunchCell && typeof lunchCell === "object") {
          for (const [room, info] of Object.entries(lunchCell)) {
            if (room === "LUNCH") continue;
            toMove.push([room, info]);
          }
        }
        // Ensure lunch slot
        dayMap[lunchSlot] = { LUNCH: { subject: "Lunch Break", faculty: "" } };

        // Relocate moved classes to nearest available slot on same day
        if (toMove.length) {
          const lunchIdx = slots.indexOf(lunchSlot);
          const order = [];
          for (let i = lunchIdx + 1; i < slots.length; i++) order.push(slots[i]);
          for (let i = lunchIdx - 1; i >= 0; i--) order.push(slots[i]);
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
        // Drop empty slots except lunchSlot
        for (const k of Object.keys(dayMap)) {
          if (k !== lunchSlot && Object.keys(dayMap[k] || {}).length === 0) delete dayMap[k];
        }
        normalized[day] = dayMap;
      }
      return normalized;
    } catch {
      return timetable;
    }
  }

  // Utilities
  const dayIndex = d => days.indexOf(d);
  const slotIndex = s => slots.indexOf(s);
  const isLunch = s => lunchSlot && s === lunchSlot;

  function newSchedule() {
    const tt = {};
    for (const d of days) tt[d] = {};
    return tt;
  }

  function ensureCell(schedule, day, slot) {
    if (!schedule[day][slot]) schedule[day][slot] = {};
    return schedule[day][slot];
  }

  function setLunchEveryDay(schedule) {
    if (!lunchSlot || !slots.includes(lunchSlot)) return;
    for (const d of days) {
      const cell = ensureCell(schedule, d, lunchSlot);
      // Clear non-lunch entries in lunch slot
      for (const k of Object.keys(cell)) {
        if (k !== "LUNCH") delete cell[k];
      }
      cell["LUNCH"] = { subject: "Lunch Break", faculty: "" };
    }
  }

  function placeFixed(schedule, errors) {
    for (const f of fixedIn) {
      const { day, slot, room, subject, faculty } = f || {};
      if (!days.includes(day) || !slots.includes(slot) || !roomNames.includes(room)) {
        errors.push({ type: "fixed_invalid", entry: f });
        continue;
      }
      if (isLunch(slot)) {
        errors.push({ type: "fixed_in_lunch", entry: f });
        continue;
      }
      const cell = ensureCell(schedule, day, slot);
      if (cell[room]) {
        errors.push({ type: "fixed_room_conflict", entry: f });
        continue;
      }
      // Check faculty double-book in same slot across rooms
      for (const [r, val] of Object.entries(cell)) {
        if (r !== "LUNCH" && val?.faculty === faculty) {
          errors.push({ type: "fixed_faculty_conflict", entry: f });
        }
      }
      cell[room] = { subject: String(subject || ""), faculty: String(faculty || "") };
    }
  }

  // Faculty availability helpers
  function getSubjectFaculty(subjectName) {
    // Expecting facAvail[subject] to be array of { faculty, available: { Day: [slot, ...] } }
    const arr = Array.isArray(facAvail?.[subjectName]) ? facAvail[subjectName] : [];
    return arr
      .map(x => ({
        faculty: x?.faculty || x?.name || x?.id || "",
        available: (x && x.available) || {},
      }))
      .filter(x => x.faculty);
  }

  function facultyHas(day, slot, faculty, subAvail) {
    const av = subAvail?.find(a => a.faculty === faculty);
    if (!av) return false;
    const daySlots = Array.isArray(av.available?.[day]) ? av.available[day] : [];
    return daySlots.includes(slot);
  }

  function anyAvailableFacultyFor(subjectName, day, slot) {
    const subs = getSubjectFaculty(subjectName);
    for (const s of subs) {
      if (facultyHas(day, slot, s.faculty, subs)) return s.faculty;
    }
    return null;
  }

  // Conflict checks
  function roomFree(schedule, day, slot, room) {
    if (isLunch(slot)) return false;
    const cell = schedule[day][slot];
    if (!cell) return true;
    return !cell[room];
  }

  function facultyFree(schedule, day, slot, faculty) {
    const cell = schedule[day][slot] || {};
    for (const [r, v] of Object.entries(cell)) {
      if (r !== "LUNCH" && v?.faculty === faculty) return false;
    }
    return true;
  }

  function putClass(schedule, day, slot, room, subject, faculty) {
    const cell = ensureCell(schedule, day, slot);
    cell[room] = { subject, faculty };
  }

  function removeClass(schedule, day, slot, room) {
    const cell = schedule[day][slot];
    if (!cell) return;
    delete cell[room];
    if (Object.keys(cell).length === 0) delete schedule[day][slot];
  }

  function parseDurationSlots(dur) {
    if (typeof dur === "number" && Number.isFinite(dur)) return Math.max(1, Math.floor(dur));
    if (typeof dur === "string") {
      const n = parseInt(dur.replace(/[^0-9]/g, ""), 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 2; // default
  }

  function slotWindowFits(day, startIdx, length) {
    for (let k = 0; k < length; k++) {
      const s = slots[startIdx + k];
      if (!s || isLunch(s)) return false;
    }
    return true;
  }

  // Candidate generation for labs
  function generateLabCandidates(strategy, schedule, lab) {
    const duration = parseDurationSlots(lab.duration);
    const preferred = lab.preferred && slots.includes(lab.preferred) ? lab.preferred : null;
    const preferredIdx = preferred ? slotIndex(preferred) : -1;
    const subjAvail = getSubjectFaculty(lab.name);

    // Slot order per strategy
    const baseSlotOrder = strategy.slotOrder();
    const dayOrder = strategy.dayOrder();

    // If preferred is set, bias starts near preferred
    const slotStarts = [];
    if (preferredIdx >= 0) {
      // Try exact, then expand window outward
      const candidates = [];
      for (let i = 0; i < slots.length; i++) candidates.push(i);
      candidates.sort((a, b) => Math.abs(a - preferredIdx) - Math.abs(b - preferredIdx));
      for (const idx of candidates) {
        if (idx + duration - 1 < slots.length) slotStarts.push(idx);
      }
    } else {
      for (let i = 0; i + duration - 1 < slots.length; i++) slotStarts.push(i);
      // Reorder slotStarts according to baseSlotOrder
      slotStarts.sort((a, b) => baseSlotOrder.indexOf(slots[a]) - baseSlotOrder.indexOf(slots[b]));
    }

    const candidates = [];
    for (const d of dayOrder) {
      for (const startIdx of slotStarts) {
        if (!slotWindowFits(d, startIdx, duration)) continue;
        // Try room assignment: fixed room or any available
        const roomsToTry = lab.room && roomNames.includes(lab.room) ? [lab.room] : roomNames.slice();
        // Try faculties allowed for the subject available across all consecutive slots
        const faculties = subjAvail.map(s => s.faculty);
        for (const room of roomsToTry) {
          // Check room free across window
          let roomOK = true;
          for (let k = 0; k < duration; k++) {
            const s = slots[startIdx + k];
            if (!roomFree(schedule, d, s, room)) {
              roomOK = false; break;
            }
          }
          if (!roomOK) continue;

          for (const fac of faculties) {
            let facOK = true;
            for (let k = 0; k < duration; k++) {
              const s = slots[startIdx + k];
              if (!facultyHas(d, s, fac, subjAvail) || !facultyFree(schedule, d, s, fac)) {
                facOK = false; break;
              }
            }
            if (!facOK) continue;

            candidates.push({
              day: d,
              startIdx,
              duration,
              room,
              faculty: fac,
              prefScore: preferredIdx >= 0 ? Math.abs(startIdx - preferredIdx) : 999,
              fixedRoomPenalty: lab.room && room !== lab.room ? 1000 : 0,
            });
          }
        }
      }
    }
    // Sort by honoring preferred start and fixed room (if any)
    candidates.sort((a, b) => (a.fixedRoomPenalty - b.fixedRoomPenalty) || (a.prefScore - b.prefScore));
    return candidates;
  }

  function assignLab(schedule, lab, candidate) {
    for (let k = 0; k < candidate.duration; k++) {
      const s = slots[candidate.startIdx + k];
      putClass(schedule, candidate.day, s, candidate.room, lab.name, candidate.faculty);
    }
  }

  function unassignLab(schedule, lab, candidate) {
    for (let k = 0; k < candidate.duration; k++) {
      const s = slots[candidate.startIdx + k];
      removeClass(schedule, candidate.day, s, candidate.room);
    }
  }

  function backtrackLabs(schedule, strategy, labList, idx = 0) {
    if (idx >= labList.length) return true;
    const lab = labList[idx];
    const candidates = generateLabCandidates(strategy, schedule, lab);

    for (const cand of candidates) {
      // If lab specifies room, enforce
      if (lab.room && cand.room !== lab.room) continue;
      assignLab(schedule, lab, cand);
      if (backtrackLabs(schedule, strategy, labList, idx + 1)) return true;
      unassignLab(schedule, lab, cand);
    }
    return false;
  }

  // Theory scheduling
  function subjectOccurrences(subject) {
    const count = Math.max(0, Math.floor(subject.weekly || 0));
    return Array.from({ length: count }, (_, i) => ({ idx: i }));
  }

  function generateTheoryCandidates(schedule, strategy, subjectName, dayCapMap) {
    const subs = getSubjectFaculty(subjectName);
    const dayOrder = strategy.dayOrder();
    const slotOrder = strategy.slotOrder();
    const candidates = [];

    for (const d of dayOrder) {
      for (const s of slotOrder) {
        if (isLunch(s)) continue;
        // Check per-day cap per subject
        const cap = (dayCapMap[subjectName]?.[d] || 0) < strategy.perDayCap ? true : false;
        if (!cap) continue;

        for (const room of roomNames) {
          if (!roomFree(schedule, d, s, room)) continue;
          for (const fac of subs.map(x => x.faculty)) {
            if (!facultyHas(d, s, fac, subs)) continue;
            if (!facultyFree(schedule, d, s, fac)) continue;
            candidates.push({ day: d, slot: s, room, faculty: fac });
          }
        }
      }
    }
    return candidates;
  }

  function scheduleTheoryGreedy(schedule, strategy, subjectsList) {
    // dayCapMap[subj][day] = count on that day
    const dayCapMap = {};
    for (const sj of subjectsList) {
      dayCapMap[sj.name] = {};
      for (const d of days) dayCapMap[sj.name][d] = 0;
    }

    // Round-robin across subjects to spread load
    let placedAll = true;
    const subjectState = subjectsList.map(sj => ({
      name: sj.name,
      remaining: Math.max(0, Math.floor(sj.weekly || 0)),
    }));

    // Try two passes: strict per-day cap, then relaxed (cap+1)
    for (let pass = 0; pass < 2; pass++) {
      const perDayCap = strategy.perDayCap + pass; // relax slightly on pass 2
      strategy.perDayCap = perDayCap;

      let progress = true;
      while (progress) {
        progress = false;
        for (const state of subjectState) {
          if (state.remaining <= 0) continue;
          const cands = generateTheoryCandidates(schedule, strategy, state.name, dayCapMap);
          if (!cands.length) continue;
          // Pick first candidate according to strategy orders
          const chosen = cands[0];
          putClass(schedule, chosen.day, chosen.slot, chosen.room, state.name, chosen.faculty);
          dayCapMap[state.name][chosen.day] += 1;
          state.remaining -= 1;
          progress = true;
        }
      }
    }

    for (const st of subjectState) {
      if (st.remaining > 0) placedAll = false;
    }
    return placedAll;
  }

  // Strategy presets for options
  function strategyA() {
    // Alternating lab days: start with Mon, Wed, Fri priority
    const dayOrder = () => ["Monday", "Wednesday", "Friday", "Tuesday", "Thursday"];
    const slotOrder = () => {
      // Prefer mid-morning then morning then afternoon (excluding lunch)
      const excl = slots.filter(s => !isLunch(s));
      const mid = Math.floor(excl.length / 2);
      const ordered = excl
        .map((s, i) => ({ s, rank: Math.abs(i - mid) }))
        .sort((a, b) => a.rank - b.rank)
        .map(x => x.s);
      return ordered;
    };
    return { dayOrder, slotOrder, perDayCap: 2 };
  }

  function strategyB() {
    // Balanced: natural day order, natural slots excluding lunch
    const dayOrder = () => days.slice();
    const slotOrder = () => slots.filter(s => !isLunch(s));
    return { dayOrder, slotOrder, perDayCap: 2 };
  }

  function strategyC() {
    // Afternoon-weighted: prefer later slots first
    const dayOrder = () => days.slice();
    const slotOrder = () => {
      const excl = slots.filter(s => !isLunch(s));
      return excl.slice().reverse();
    };
    return { dayOrder, slotOrder, perDayCap: 2 };
  }

  function cloneSchedule(schedule) {
    const out = {};
    for (const d of days) {
      out[d] = {};
      for (const s of Object.keys(schedule[d] || {})) {
        out[d][s] = { ...(schedule[d][s] || {}) };
      }
    }
    return out;
  }

  function pruneEmptyNonLunchSlots(schedule) {
    for (const d of days) {
      for (const s of Object.keys(schedule[d])) {
        if (s !== lunchSlot && Object.keys(schedule[d][s]).length === 0) {
          delete schedule[d][s];
        }
      }
    }
  }

  function buildOption(strategy, recoText) {
    const errors = [];
    const schedule = newSchedule();

    // 1) Set lunch blockers
    setLunchEveryDay(schedule);

    // 2) Place fixed classes
    placeFixed(schedule, errors);

    // 3) Labs once per week, consecutive, preferred handling, faculty+room clashes avoided
    const labsOrder = labsIn.slice(); // could sort by duration descending
    labsOrder.sort((a, b) => parseDurationSlots(b.duration) - parseDurationSlots(a.duration));
    const labsOK = backtrackLabs(schedule, strategy, labsOrder);

    // 4) Theory classes: exact weekly counts, spread across days, per-day cap heuristic
    const theoryOK = scheduleTheoryGreedy(schedule, strategy, subjectsIn);

    // 5) Clean and normalize lunch representation
    pruneEmptyNonLunchSlots(schedule);
    const normalized = normalizeLunch(schedule);

    // Even if not fully satisfiable, return the best-effort timetable
    return {
      timetable: normalized,
      recommendation: recoText,
      _status: { labsOK, theoryOK, errors },
    };
  }

  // Build three distinct options (no logic change; refine reco copy)
  const optA = buildOption(
    strategyA(),
    "Labs are grouped on alternating days to keep practicals together while easing transitions for faculty and students."
  );
  const optB = buildOption(
    strategyB(),
    "Classes are evenly spread across the week for steady, predictable daily workloads."
  );
  const optC = buildOption(
    strategyC(),
    "Afternoons carry more classes, leaving lighter mornings for prep and catch‑up."
  );

  // Shape exactly like original response path
  const options = [optA, optB, optC].map(o => ({ timetable: o.timetable, recommendation: o.recommendation }));
  try {
    console.log("[generateTimetableLocal] options", options.length);
    console.log("[generateTimetableLocal] Monday slots example", Object.keys(options[0].timetable.Monday || {}));
  } catch {}

  return res.status(200).json({ timetableOptions: options });
}