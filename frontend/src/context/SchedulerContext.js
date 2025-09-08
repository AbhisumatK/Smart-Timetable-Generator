import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const SchedulerContext = createContext();

function userKey(userId, key) {
  return `user-${userId || "guest"}-${key}`;
}

// Custom hook to sync state with localStorage per key
function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

export function SchedulerProvider({ children, currentUser: providedUser }) {
  const [currentUser, setCurrentUser] = useState(providedUser || null);

  // Compose keys using user id
  const timeSlotsKey = userKey(currentUser?.id, "timeSlots");
  const subjectsKey = userKey(currentUser?.id, "subjects");
  const labsKey = userKey(currentUser?.id, "labs");
  const classroomsKey = userKey(currentUser?.id, "classrooms");
  const timetableKey = userKey(currentUser?.id, "timetable");
  const conflictsKey = userKey(currentUser?.id, "conflicts");
  const timetableOptionsKey = userKey(currentUser?.id, "timetableOptions");
  const facultyAssignmentsKey = userKey(currentUser?.id, "facultyAssignments");
  const fixedClassesKey = userKey(currentUser?.id, "fixedClasses");
  const draftTimetablesKey = userKey(currentUser?.id, "draftTimetables");
  const lunchSlotKey = userKey(currentUser?.id, "lunchSlot");

  // Use new custom hook for each piece of state
  const [timeSlots, setTimeSlots] = useLocalStorageState(timeSlotsKey, []);
  const [subjects, setSubjects] = useLocalStorageState(subjectsKey, []);
  const [labs, setLabs] = useLocalStorageState(labsKey, []);
  const [classrooms, setClassrooms] = useLocalStorageState(classroomsKey, []);
  const [timetable, setTimetable] = useLocalStorageState(timetableKey, null);
  const [conflicts, setConflicts] = useLocalStorageState(conflictsKey, []);
  const [timetableOptions, setTimetableOptions] = useLocalStorageState(timetableOptionsKey, []);
  const [facultyAssignments, setFacultyAssignments] = useLocalStorageState(facultyAssignmentsKey, {});
  const [fixedClasses, setFixedClasses] = useLocalStorageState(fixedClassesKey, []);
  const [draftTimetables, setDraftTimetables] = useLocalStorageState(draftTimetablesKey, []);
  const [lunchSlot, setLunchSlot] = useLocalStorageState(lunchSlotKey, null);

  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const prevUserRef = useRef();
  const lastGenSignatureRef = useRef("");
  const lastGenAtRef = useRef(0);

  useEffect(() => {
    if (prevUserRef.current && prevUserRef.current.id !== currentUser?.id) {
      setTimeSlots([]);
      setSubjects([]);
      setLabs([]);
      setClassrooms([]);
      setTimetable(null);
      setConflicts([]);
      setTimetableOptions([]);
      setFacultyAssignments({});
      setFixedClasses([]);
      setDraftTimetables([]);
      setLunchSlot(null);
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  async function generateTimetables(inputData) {
    // Skip if already generating
    if (generating) return;
    setGenerating(true);
    setGenerationError(null);
    try {
      const payload = {
        classrooms,
        timeSlots,
        labs,
        subjects,
        facultyAvailability: facultyAssignments,
        fixedClasses,
        lunchSlot,
        ...(inputData || {})
      };
      try {
        console.log("[generateTimetables] payload", {
          classrooms: Array.isArray(classrooms) ? classrooms.length : 0,
          timeSlots: Array.isArray(timeSlots) ? timeSlots.length : 0,
          labs: Array.isArray(labs) ? labs.length : 0,
          subjects: Array.isArray(subjects) ? subjects.length : 0,
          fixedClasses: Array.isArray(fixedClasses)
            ? fixedClasses.length
            : (fixedClasses && typeof fixedClasses === "object")
            ? Object.keys(fixedClasses).length
            : 0,
          lunchSlot: lunchSlot || null,
        });
      } catch {}

      // Deduplicate same-request bursts (common with multiple state updates)
      const signature = JSON.stringify(payload);
      const now = Date.now();
      if (lastGenSignatureRef.current === signature && now - lastGenAtRef.current < 4000) {
        // Another identical call fired recently; skip
        return;
      }
      lastGenSignatureRef.current = signature;
      lastGenAtRef.current = now;
      const res = await fetch("/api/generateTimetablePerplexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Timetable generation failed");

      const data = await res.json();
      try { console.log("[generateTimetables] raw response", data); } catch {}
      let options = data.timetableOptions;

      if (typeof options === "string") {
        try {
          const trimmed = options.trim();
          if (!trimmed.startsWith("[")) {
            options = "[" + options + "]";
          }
          options = JSON.parse(options);
        } catch (err) {
          console.error("Error parsing timetableOptions JSON string:", err);
          options = [];
        }
      }

      // Ensure array of option objects
      if (!Array.isArray(options)) options = [];
      options = options
        .map((o) => (o && o.timetable ? o : { timetable: o || {}, recommendation: "" }))
        .filter((o) => o && typeof o === "object");

      try {
        console.log("[generateTimetables] parsed options", options.length, options[0] && Object.keys(options[0].timetable || {}));
      } catch {}

      // No local fallback. If fewer than 3 options, duplicate to reach 3 so the UI renders consistently

      // If still fewer than 3, duplicate with labels to satisfy UI expectation
      while (options.length < 3 && options.length > 0) {
        const base = options[0];
        options.push({ timetable: base.timetable, recommendation: base.recommendation || "Alternative arrangement" });
      }

      setTimetableOptions(options);
    } catch (error) {
      setGenerationError(error.message);
      // On failure, ensure no timetables are loaded/displayed
      try { setTimetableOptions([]); } catch {}
      try { setTimetable(null); } catch {}
      try { console.error("[generateTimetables] error", error); } catch {}
    } finally {
      setGenerating(false);
      try { console.log("[generateTimetables] done"); } catch {}
    }
  }

  async function addDraft(timetableData, metadata = {}) {
    const draftPayload = {
      timetable: timetableData,
      status: "draft",
      createdAt: new Date().toISOString(),
      ownerId: currentUser?.id || null,
      ...metadata,
    };
    try {
      const res = await fetch("/api/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftPayload),
      });
      if (!res.ok) throw new Error("Failed to save draft");
      const created = await res.json();
      setDraftTimetables((drafts) => [...drafts, created]);
      return created;
    } catch (e) {
      // Fallback to local state if API fails
      const localDraft = { id: Date.now().toString(), ...draftPayload };
      setDraftTimetables((drafts) => [...drafts, localDraft]);
      return localDraft;
    }
  }

  async function submitForApproval(id) {
    try {
      const res = await fetch(`/api/timetables/${id}/submit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      if (!res.ok) throw new Error("Failed to submit draft");
      setDraftTimetables((drafts) => drafts.map((d) => (d.id === id ? { ...d, status: "pending", submittedAt: new Date().toISOString() } : d)));
    } catch {}
  }

  async function approveTimetable(id, approver) {
    try {
      const res = await fetch(`/api/timetables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", approver }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      setDraftTimetables((drafts) => drafts.map((d) => (d.id === id ? { ...d, status: "approved", approvedBy: approver, approvedAt: new Date().toISOString(), comments: "" } : d)));
    } catch {}
  }

  async function rejectTimetable(id, approver, comments) {
    try {
      const res = await fetch(`/api/timetables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", approver, comments }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      setDraftTimetables((drafts) => drafts.map((d) => (d.id === id ? { ...d, status: "rejected", approvedBy: approver, approvedAt: new Date().toISOString(), comments } : d)));
    } catch {}
  }

  return (
    <SchedulerContext.Provider
      value={{
        timeSlots,
        setTimeSlots,
        subjects,
        setSubjects,
        labs,
        setLabs,
        classrooms,
        setClassrooms,
        timetable,
        setTimetable,
        conflicts,
        setConflicts,
        timetableOptions,
        setTimetableOptions,
        facultyAssignments,
        setFacultyAssignments,
        fixedClasses,
        setFixedClasses,
        draftTimetables,
        setDraftTimetables,
        generating,
        generationError,
        currentUser,
        setCurrentUser,
        generateTimetables,
        addDraft,
        submitForApproval,
        approveTimetable,
        rejectTimetable,
        lunchSlot,
        setLunchSlot,
      }}
    >
      {children}
    </SchedulerContext.Provider>
  );
}

export function useScheduler() {
  return useContext(SchedulerContext);
}