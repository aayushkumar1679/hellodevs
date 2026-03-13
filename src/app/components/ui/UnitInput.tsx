"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface UnitInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  units?: string[];
  placeholder?: string;
}

export default function UnitInput({
  label,
  value,
  onChange,
  units = ["px", "%", "rem", "em", "vh", "vw", "auto"],
  placeholder,
}: UnitInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [unit, setUnit] = useState(units[0]);

  // Parse incoming value (e.g., "10px" -> 10, "px")
  useEffect(() => {
    const strValue = String(value || "");
    if (strValue === "auto") {
      setInputValue("auto");
      setUnit("auto");
      return;
    }

    const num = parseFloat(strValue);
    const u = strValue.replace(/[0-9.-]/g, "") || units[0];

    if (isNaN(num)) {
      setInputValue("");
    } else {
      setInputValue(String(num));
    }
    setUnit(u);
  }, [value, units]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === "auto") {
      onChange("auto");
    } else if (val === "") {
      onChange("");
    } else {
      onChange(`${val}${unit}`);
    }
  };

  const handleUnitChange = (u: string) => {
    setUnit(u);
    if (u === "auto") {
      setInputValue("auto");
      onChange("auto");
    } else if (inputValue && inputValue !== "auto") {
      onChange(`${inputValue}${u}`);
    }
  };

  return (
    <div className="group flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-sky-500 transition-colors">
          {label}
        </label>
      )}
      <div className="relative flex h-9 items-center overflow-hidden rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm transition-all focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 shadow-sm hover:border-slate-300">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="h-full w-full bg-transparent pl-3 pr-12 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300"
        />
        <div className="absolute right-0 flex h-full items-center border-l border-slate-100 bg-slate-50/50 px-1.5">
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="appearance-none bg-transparent pr-4 text-[10px] font-bold uppercase tracking-tight text-slate-500 outline-none cursor-pointer hover:text-slate-900"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
