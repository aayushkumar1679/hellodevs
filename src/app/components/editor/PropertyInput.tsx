"use client";

import React from "react";

interface PropertyInputProps {
  label: string;
  type: "text" | "select" | "color" | "range" | "number";
  value: string | number;
  onChange: (value: string | number) => void;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function PropertyInput({
  label,
  type,
  value,
  onChange,
  options,
  placeholder,
  min,
  max,
  step,
}: PropertyInputProps) {
  const baseInputClass =
    "w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>

      {type === "text" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseInputClass}
        />
      )}

      {type === "number" && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={baseInputClass}
        />
      )}

      {type === "select" && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        >
          <option value="">Auto</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {type === "color" && (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className={baseInputClass}
          />
        </div>
      )}

      {type === "range" && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400 min-w-max">{value}</span>
        </div>
      )}
    </div>
  );
}
