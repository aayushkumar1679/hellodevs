"use client";

import React from "react";

interface VisualOption {
  value: string;
  label: string;
  icon: React.ElementType;
}

interface VisualSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: VisualOption[];
}

export default function VisualSelect({
  label,
  value,
  onChange,
  options,
}: VisualSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white/50 p-1 backdrop-blur-sm">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = value === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              title={opt.label}
              className={`flex h-full flex-1 items-center justify-center rounded-lg transition-all ${
                isActive
                  ? "bg-white text-sky-600 shadow-sm ring-1 ring-slate-100"
                  : "text-slate-400 hover:bg-white/60 hover:text-slate-600"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
