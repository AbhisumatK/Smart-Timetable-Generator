import { useState } from "react";

export default function InputList({ label, value, setValue, placeholder, onAdd, onRemove, children }) {
  const [input, setInput] = useState("");

  return (
    <div>
      <label className="block mb-2 font-semibold">{label}</label>
      <div className="flex gap-2">
        <input
          className="border px-2 py-1 rounded w-full"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => (e.key === "Enter" && onAdd(input) && setInput(""))}
        />
        <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={() => { onAdd(input); setInput(""); }}>Add</button>
      </div>
      <div className="mt-2 space-y-1">
        {value.map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
            {children ? children(item) : item}
            <button className="text-red-600" onClick={() => onRemove(i)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}