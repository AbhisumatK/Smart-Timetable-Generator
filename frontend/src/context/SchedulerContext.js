import { createContext, useContext, useState, useEffect } from "react";
import { getSession, signIn } from "next-auth/react";

const SchedulerContext = createContext();

function userKey(userId, key) {
  return `user-${userId || "guest"}-${key}`;
}

export function SchedulerProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [timeSlots, setTimeSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [labs, setLabs] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [timetableOptions, setTimetableOptions] = useState([]);
  const [facultyAssignments, setFacultyAssignments] = useState({});
  const [fixedClasses, setFixedClasses] = useState([]);
  const [draftTimetables, setDraftTimetables] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Load user session and sign-in redirect if no session
  useEffect(() => {
    getSession().then((session) => {
      if (!session) signIn();
      else setCurrentUser(session.user);
    });
  }, []);

  // Hydrate states from localStorage after currentUser is set
  useEffect(() => {
    if (!currentUser) return;
    if (typeof window === "undefined") return;

    const ls = window.localStorage;

    const loadOrDefault = (key, defaultValue) => {
      const item = ls.getItem(userKey(currentUser.id, key));
      try {
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    };

    setTimeSlots(loadOrDefault("timeSlots", []));
    setSubjects(loadOrDefault("subjects", []));
    setLabs(loadOrDefault("labs", []));
    setClassrooms(loadOrDefault("classrooms", []));
    setTimetable(loadOrDefault("timetable", null));
    setConflicts(loadOrDefault("conflicts", []));
    setTimetableOptions(loadOrDefault("timetableOptions", []));
    setFacultyAssignments(loadOrDefault("facultyAssignments", {}));
    setFixedClasses(loadOrDefault("fixedClasses", []));
    setDraftTimetables(loadOrDefault("draftTimetables", []));
  }, [currentUser]);

  // Save changes back to localStorage keyed by user id

  useEffect(() => {
    if (!currentUser || !timeSlots) return;
    localStorage.setItem(userKey(currentUser.id, "timeSlots"), JSON.stringify(timeSlots));
  }, [timeSlots, currentUser]);

  useEffect(() => {
    if (!currentUser || !subjects) return;
    localStorage.setItem(userKey(currentUser.id, "subjects"), JSON.stringify(subjects));
  }, [subjects, currentUser]);

  useEffect(() => {
    if (!currentUser || !labs) return;
    localStorage.setItem(userKey(currentUser.id, "labs"), JSON.stringify(labs));
  }, [labs, currentUser]);

  useEffect(() => {
    if (!currentUser || !classrooms) return;
    localStorage.setItem(userKey(currentUser.id, "classrooms"), JSON.stringify(classrooms));
  }, [classrooms, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(userKey(currentUser.id, "timetable"), JSON.stringify(timetable));
  }, [timetable, currentUser]);

  useEffect(() => {
    if (!currentUser || !conflicts) return;
    localStorage.setItem(userKey(currentUser.id, "conflicts"), JSON.stringify(conflicts));
  }, [conflicts, currentUser]);

  useEffect(() => {
    if (!currentUser || !timetableOptions) return;
    localStorage.setItem(userKey(currentUser.id, "timetableOptions"), JSON.stringify(timetableOptions));
  }, [timetableOptions, currentUser]);

  useEffect(() => {
    if (!currentUser || !facultyAssignments) return;
    localStorage.setItem(userKey(currentUser.id, "facultyAssignments"), JSON.stringify(facultyAssignments));
  }, [facultyAssignments, currentUser]);

  useEffect(() => {
    if (!currentUser || !fixedClasses) return;
    localStorage.setItem(userKey(currentUser.id, "fixedClasses"), JSON.stringify(fixedClasses));
  }, [fixedClasses, currentUser]);

  useEffect(() => {
    if (!currentUser || !draftTimetables) return;
    localStorage.setItem(userKey(currentUser.id, "draftTimetables"), JSON.stringify(draftTimetables));
  }, [draftTimetables, currentUser]);

  async function generateTimetables(inputData) {
    setGenerating(true);
    setGenerationError(null);
    try {
      // Compose input data from existing state
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
  function addDraft(draft) {
    setDraftTimetables((drafts) => [...drafts, draft]);
  }
  // Submit for approval
  function submitForApproval(id) {
    setDraftTimetables((drafts) =>
      drafts.map((d) => (d.id === id ? { ...d, status: "pending" } : d))
    );
  }
  // Approve timetable
  function approveTimetable(id, approver) {
    setDraftTimetables((drafts) =>
      drafts.map((d) =>
        d.id === id
          ? { ...d, status: "approved", approvedBy: approver, approvedAt: new Date().toISOString() }
          : d
      )
    );
  }
  // Reject timetable with comments
  function rejectTimetable(id, approver, comments) {
    setDraftTimetables((drafts) =>
      drafts.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "rejected",
              approvedBy: approver,
              comments,
              approvedAt: new Date().toISOString(),
            }
          : d
      )
    );
  }

  return (
    <SchedulerContext.Provider value={{
      timeSlots, setTimeSlots,
      subjects, setSubjects,
      labs, setLabs,
      classrooms, setClassrooms,
      timetable, setTimetable,
      conflicts, setConflicts,
      timetableOptions, setTimetableOptions,
      facultyAssignments, setFacultyAssignments,
      fixedClasses, setFixedClasses,
      draftTimetables, setDraftTimetables,
      generating, generationError,
      currentUser, setCurrentUser,
      generateTimetables,
      approveTimetable, rejectTimetable
    }}>
      {children}
    </SchedulerContext.Provider>
  );
}

export function useScheduler() {
  return useContext(SchedulerContext);
}