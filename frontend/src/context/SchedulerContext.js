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

  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const prevUserRef = useRef();

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
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  async function generateTimetables(inputData) {
    setGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/generateTimetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      if (!res.ok) throw new Error("Timetable generation failed");

      const data = await res.json();
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
      setTimetableOptions(options);
    } catch (error) {
      setGenerationError(error.message);
    } finally {
      setGenerating(false);
    }
  }

  function addDraft(timetableData, metadata = {}) {
    const newDraft = {
      id: Date.now().toString(),
      timetable: timetableData,
      status: "draft",
      createdAt: new Date().toISOString(),
      ...metadata,
    };
    setDraftTimetables((drafts) => [...drafts, newDraft]);
  }

  function submitForApproval(id) {
    setDraftTimetables((drafts) =>
      drafts.map((draft) => (draft.id === id ? { ...draft, status: "pending" } : draft))
    );
  }

  function approveTimetable(id, approver) {
    setDraftTimetables((drafts) =>
      drafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              status: "approved",
              approvedBy: approver,
              approvedAt: new Date().toISOString(),
            }
          : draft
      )
    );
  }

  function rejectTimetable(id, approver, comments) {
    setDraftTimetables((drafts) =>
      drafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              status: "rejected",
              approvedBy: approver,
              comments,
              approvedAt: new Date().toISOString(),
            }
          : draft
      )
    );
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
      }}
    >
      {children}
    </SchedulerContext.Provider>
  );
}

export function useScheduler() {
  return useContext(SchedulerContext);
}