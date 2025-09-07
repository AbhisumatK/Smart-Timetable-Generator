import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function InputList({ label, value, setValue, placeholder, onAdd, onRemove, children }) {
  const [input, setInput] = useState("");
  const { isDark } = useTheme();

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
            <span className={isDark ? "text-slate-200" : "text-slate-800"}>{children ? children(item) : String(item)}</span>
            <button className={isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"} onClick={() => onRemove(i)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}