"use client";

import React from "react";
import { Pipette } from "lucide-react";

interface ColorInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ColorInput({ label, value, onChange }: ColorInputProps) {
  const isGradient = value?.includes("gradient");

  return (
    <div className="group flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-sky-500 transition-colors">
          {label}
        </label>
      )}
      <div className="relative flex h-9 items-center overflow-hidden rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm transition-all focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 shadow-sm hover:border-slate-300">
        {/* Visual Preview Swatch */}
        <div className="relative ml-2 h-5 w-5 shrink-0 overflow-hidden rounded-md border border-slate-200 shadow-sm">
          {isGradient ? (
            <div 
              className="h-full w-full" 
              style={{ background: value }} 
            />
          ) : (
            <input
              type="color"
              value={value?.startsWith("#") ? value : "#ffffff"}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-[-4px] h-[calc(100%+8px)] w-[calc(100%+8px)] cursor-pointer bg-transparent border-none appearance-none"
            />
          )}
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hex, RGB, or Gradient"
          className="h-full w-full bg-transparent px-3 text-xs font-mono font-medium text-slate-600 outline-none placeholder:text-slate-300"
        />

        {/* Action Icon */}
        <div className="flex h-full items-center pr-2">
          <Pipette className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-slate-600" />
        </div>
      </div>
    </div>
  );
}
