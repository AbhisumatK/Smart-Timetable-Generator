import { createContext, useContext, useState, useEffect } from "react";
import { getSession, signIn, signOut } from "next-auth/react";

const SchedulerContext = createContext();

export function SchedulerProvider({ children }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [labs, setLabs] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [timetableOptions, setTimetableOptions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [draftTimetables, setDraftTimetables] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [facultyAssignments, setFacultyAssignments] = useState({});

  useEffect(() => {
        getSession().then(session => {
            if (!session) signIn();
            console.log(session.user);
        });
  }, []);

  async function generateTimetables() {
    setGenerating(true);
    setGenerationError(null);
    try {
      // Compose input data from existing state
      const inputData = {
        classrooms: Object.keys(classrooms),
        timeSlots: timeSlots,
        subjects: subjects.reduce((acc, s) => {
          acc[s.name] = s.weekly;
          return acc;
        }, {}),
        facultyAvailability: {}, // Add if tracked or leave empty
        specialClasses: [],       // Add special classes if tracked
      };

      const res = await fetch("/api/generateTimetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });

      if (!res.ok) throw new Error("Timetable generation failed");

      const { timetableOptions } = await res.json();
      setTimetableOptions(timetableOptions);
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
      generating, generationError,
      generateTimetables,
    }}>
      {children}
    </SchedulerContext.Provider>
  );
}

export function useScheduler() {
  return useContext(SchedulerContext);
}