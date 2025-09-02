export default function TimetableTable({ timetable, timeSlots }) {
  const days = Object.keys(timetable);
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr>
          <th className="border px-3 py-1">Day</th>
          {timeSlots.map((slot, idx) => (
            <th key={idx} className="border px-3 py-1">{slot}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map(day => (
          <tr key={day}>
            <td className="border px-3 py-1 font-bold">{day}</td>
            {timeSlots.map((slot, idx) => (
              <td key={idx} className="border px-3 py-1">{timetable[day][slot] || "--"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}