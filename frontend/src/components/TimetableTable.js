import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function TimetableTable({
  timetable,
  timeSlots,
  customizeMode,
  onTimetableChange,
}) {
  const days = Object.keys(timetable);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const { isDark } = useTheme();

  const handleBlockClick = (day, slot) => {
    if (!customizeMode) return;
    if (!selectedBlock) {
      setSelectedBlock({ day, slot });
    } else {
      if (selectedBlock.day === day && selectedBlock.slot === slot) {
        setSelectedBlock(null);
        return;
      }

      const newTimetable = {};
      days.forEach((d) => {
        newTimetable[d] = { ...timetable[d] };
      });

      const firstSubject = newTimetable[selectedBlock.day][selectedBlock.slot];
      const secondSubject = newTimetable[day][slot];

      newTimetable[selectedBlock.day][selectedBlock.slot] = secondSubject;
      newTimetable[day][slot] = firstSubject;

      onTimetableChange(newTimetable);
      setSelectedBlock(null);
    }
  };

  return (
    <div className="w-full max-w-full">
      <table
        className={`w-full border mt-4 backdrop-blur-xl rounded-xl table-fixed shadow-2xl ${
          isDark
            ? "border-cyan-500/30 bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-800/40 shadow-cyan-500/10"
            : "border-cyan-500/50 bg-gradient-to-br from-white/90 via-slate-50/80 to-white/90 shadow-cyan-500/30"
        }`}
      >
        <thead>
          <tr
            className={`backdrop-blur ${
              isDark
                ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20"
                : "bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30"
            }`}
          >
            <th
              className={`border px-1 py-1 font-bold text-xs sm:text-sm w-16 sm:w-20 ${
                isDark
                  ? "border-cyan-500/30 text-cyan-200 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                  : "border-cyan-500/50 text-cyan-800 bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
              }`}
            >
              Day
            </th>
            {timeSlots.map((slot, idx) => (
              <th
                key={idx}
                className={`border px-1 py-1 font-bold text-xs sm:text-sm ${
                  isDark
                    ? "border-cyan-500/30 text-cyan-200 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                    : "border-cyan-500/50 text-cyan-800 bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                }`}
              >
                <div className="truncate" title={slot}>
                  {slot}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr
              key={day}
              className={`transition-all duration-300 ${
                isDark
                  ? "hover:bg-gradient-to-r hover:from-slate-700/20 hover:to-slate-600/20"
                  : "hover:bg-gradient-to-r hover:from-slate-200/50 hover:to-slate-300/50"
              }`}
            >
              <td
                className={`border px-1 py-1 font-bold text-xs sm:text-sm w-16 sm:w-20 ${
                  isDark
                    ? "border-cyan-500/20 text-cyan-200 bg-gradient-to-br from-slate-700/30 to-slate-600/30"
                    : "border-cyan-500/40 text-cyan-800 bg-gradient-to-br from-slate-200/60 to-slate-300/60"
                }`}
              >
                <div className="truncate" title={day}>
                  {day}
                </div>
              </td>
              {timeSlots.map((slot, idx) => {
                const isSelected =
                  selectedBlock?.day === day && selectedBlock?.slot === slot;

                // Safely access cell, handling missing data
                const cell = timetable[day]?.[slot];

                return (
                  <td
                    key={idx}
                    className={`border px-1 py-1 cursor-pointer select-none transition-all duration-300 text-xs sm:text-sm ${
                      isSelected
                        ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-105 border-cyan-500/50"
                        : isDark
                        ? "border-cyan-500/20 text-slate-300 hover:bg-gradient-to-br hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-white hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
                        : "group border-cyan-500/40 text-slate-700 hover:bg-gradient-to-br hover:from-cyan-500/40 hover:to-blue-500/40 hover:!text-black hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
                    }`}
                    onClick={() => handleBlockClick(day, slot)}
                  >
                    <div className="truncate">
                      {!cell || Object.keys(cell).length === 0 ? (
                        <span
                          className={`italic ${
                            isDark ? "text-slate-500" : "text-slate-600 group-hover:!text-black"
                          }`}
                        >
                          --
                        </span>
                      ) : (
                        Object.entries(cell).map(([room, info]) => {
                          const subject = info.subject || "--";
                          const faculty = info.faculty || "";
                          return (
                            <div key={room} className="mb-1 last:mb-0">
                              <strong
                                title={`Classroom ${room}`}
                                className={`block truncate font-semibold ${
                                  isDark ? "" : "group-hover:!text-black"
                                }`}
                              >
                                Room {room}
                              </strong>
                              <div className="truncate">
                                <span
                                  className={`font-bold ${
                                    isDark ? "text-white" : "text-slate-800 group-hover:!text-black"
                                  }`}
                                  title={subject}
                                >
                                  {subject}
                                </span>
                                {faculty && (
                                  <span
                                    className={`text-xs ml-1 ${
                                      isDark ? "text-cyan-200" : "text-cyan-700 group-hover:!text-black"
                                    }`}
                                    title={faculty}
                                  >
                                    ({faculty})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}