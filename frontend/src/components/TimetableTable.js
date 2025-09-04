import React, { useState } from "react";

export default function TimetableTable({
  timetable,
  timeSlots,
  customizeMode,
  onTimetableChange,
}) {
  const days = Object.keys(timetable);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const handleBlockClick = (day, slot) => {
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
    <div className="overflow-x-auto">
      <table className="w-full border border-slate-600/50 mt-4 bg-slate-800/30 backdrop-blur rounded-lg">
        <thead>
          <tr className="bg-slate-700/50">
            <th className="border border-slate-600/50 px-3 py-2 text-slate-200 font-semibold">
              Day
            </th>
            {timeSlots.map((slot, idx) => (
              <th
                key={idx}
                className="border border-slate-600/50 px-3 py-2 text-slate-200 font-semibold"
              >
                {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day} className="hover:bg-slate-700/30">
              <td className="border border-slate-600/50 px-3 py-2 font-bold text-slate-200">
                {day}
              </td>
              {timeSlots.map((slot, idx) => {
                const isSelected =
                  selectedBlock?.day === day && selectedBlock?.slot === slot;
                return (
                  <td
                    key={idx}
                    className={`border border-slate-600/50 px-3 py-2 text-slate-300 cursor-pointer select-none ${
                      isSelected ? "bg-cyan-600 text-white" : ""
                    }`}
                    onClick={() => handleBlockClick(day, slot)}
                  >
                    {timetable[day][slot] || "--"}
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