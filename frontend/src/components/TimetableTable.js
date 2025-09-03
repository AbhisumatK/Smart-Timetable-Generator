export default function TimetableTable({ timetable, timeSlots }) {
  if (!timetable || !timeSlots || timeSlots.length === 0) {
    return <p className="text-center p-4">No timetable data available.</p>;
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <table className="w-full border-collapse border border-gray-300 mt-4">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2 bg-gray-100">Day / Time</th>
          {timeSlots.map((slot) => (
            <th key={slot} className="border border-gray-300 px-4 py-2 bg-gray-100">
              {slot}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day} className="even:bg-gray-50">
            <td className="border border-gray-300 px-4 py-2 font-semibold">{day}</td>
            {timeSlots.map((slot) => (
              <td key={slot} className="border border-gray-300 px-4 py-2 text-center whitespace-pre-line">
                {timetable[day] && timetable[day][slot] ? timetable[day][slot] : "--"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}