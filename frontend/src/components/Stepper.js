const STEPS = [
  "Start", "Time Slots", "Subjects", "FixedClasses", "Labs", "Classrooms", "Review"
];
export default function Stepper({ step }) {
  return (
    <ol className="flex mb-6 gap-4">
      {STEPS.map((title, i) => (
        <li key={i} className={`px-4 py-1 rounded-full border ${i === step ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}>
          {title}
        </li>
      ))}
    </ol>
  );
}