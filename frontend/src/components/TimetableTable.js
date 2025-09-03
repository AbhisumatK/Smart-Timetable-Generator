export default function TimetableTable({ timetable, timeSlots }) {
  const days = Object.keys(timetable);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-slate-600/50 mt-4 bg-slate-800/30 backdrop-blur rounded-lg">
        <thead>
          <tr className="bg-slate-700/50">
            <th className="border border-slate-600/50 px-3 py-2 text-slate-200 font-semibold">Day</th>
            {timeSlots.map((slot, idx) => (
              <th key={idx} className="border border-slate-600/50 px-3 py-2 text-slate-200 font-semibold">{slot}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day} className="hover:bg-slate-700/30">
              <td className="border border-slate-600/50 px-3 py-2 font-bold text-slate-200">{day}</td>
              {timeSlots.map((slot, idx) => (
                <td key={idx} className="border border-slate-600/50 px-3 py-2 text-slate-300">{timetable[day][slot] || "--"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}