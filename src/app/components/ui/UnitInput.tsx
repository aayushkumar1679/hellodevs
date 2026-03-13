"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface UnitInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  units?: string[];
  placeholder?: string;
}

function parseUnitValue(value: string | number, fallbackUnit: string) {
  const stringValue = String(value || "");

  if (stringValue === "auto") {
    return {
      inputValue: "auto",
      unit: "auto",
    };
  }

  const numericValue = parseFloat(stringValue);
  const unit = stringValue.replace(/[0-9.-]/g, "") || fallbackUnit;

  return {
    inputValue: Number.isNaN(numericValue) ? "" : String(numericValue),
    unit,
  };
}

export default function UnitInput({
  label,
  value,
  onChange,
  units = ["px", "%", "rem", "em", "vh", "vw", "auto"],
  placeholder,
}: UnitInputProps) {
  const parsed = parseUnitValue(value, units[0]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (nextValue === "auto") {
      onChange("auto");
      return;
    }

    if (nextValue === "") {
      onChange("");
      return;
    }

    onChange(`${nextValue}${parsed.unit}`);
  };

  const handleUnitChange = (nextUnit: string) => {
    if (nextUnit === "auto") {
      onChange("auto");
      return;
    }

    if (!parsed.inputValue || parsed.inputValue === "auto") {
      onChange("");
      return;
    }

    onChange(`${parsed.inputValue}${nextUnit}`);
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
          value={parsed.inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="h-full w-full bg-transparent pl-3 pr-12 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300"
        />
        <div className="absolute right-0 flex h-full items-center border-l border-slate-100 bg-slate-50/50 px-1.5">
          <select
            value={parsed.unit}
            onChange={(event) => handleUnitChange(event.target.value)}
            className="appearance-none bg-transparent pr-4 text-[10px] font-bold uppercase tracking-tight text-slate-500 outline-none cursor-pointer hover:text-slate-900"
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
