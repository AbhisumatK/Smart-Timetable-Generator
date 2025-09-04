import { useState } from "react";

export default function InputList({ label, value, setValue, placeholder, onAdd, onRemove, children }) {
  const [input, setInput] = useState("");

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => (e.key === "Enter" && onAdd(input) && setInput(""))}
        />
        <button className="btn-primary" onClick={() => { onAdd(input); setInput(""); }}>Add</button>
      </div>
      <div className="mt-2 space-y-2">
        {value.map((item, i) => (
          <div key={i} className="card flex items-center justify-between px-3 py-2">
            <span className="text-slate-200">{children ? children(item) : String(item)}</span>
            <button className="text-red-400 hover:text-red-300" onClick={() => onRemove(i)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}