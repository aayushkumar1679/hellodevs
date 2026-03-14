"use client";

import React from "react";

interface SpacingDiagramProps {
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  padding: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  onMarginChange: (side: "top" | "right" | "bottom" | "left", value: string) => void;
  onPaddingChange: (side: "top" | "right" | "bottom" | "left", value: string) => void;
}

export default function SpacingDiagram({
  margin,
  padding,
  onMarginChange,
  onPaddingChange,
}: SpacingDiagramProps) {
  const Input = ({ 
    value, 
    onChange, 
    placeholder = "0" 
  }: { 
    value: string; 
    onChange: (val: string) => void;
    placeholder?: string;
  }) => (
    <input
      type="text"
      value={value === "auto" ? "A" : value.replace(/px|rem|em|%/g, "")}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-full bg-transparent text-[8px] font-black text-center outline-none focus:text-indigo-600 transition-colors"
    />
  );

  return (
    <div className="relative w-full aspect-[16/10] bg-slate-50 rounded-xl border border-slate-100 p-6 select-none">
      {/* Margin Box */}
      <div className="absolute inset-2 border border-slate-200 rounded-lg bg-orange-50/20 pointer-events-none">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1 bg-white text-[7px] font-black uppercase tracking-tighter text-orange-400">Margin</div>
      </div>
      
      {/* Margin Inputs */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-slate-100">
        <Input value={margin.top} onChange={(v) => onMarginChange("top", v)} />
      </div>
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-slate-100">
        <Input value={margin.bottom} onChange={(v) => onMarginChange("bottom", v)} />
      </div>
      <div className="absolute top-1/2 left-2.5 -translate-y-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-slate-100">
        <Input value={margin.left} onChange={(v) => onMarginChange("left", v)} />
      </div>
      <div className="absolute top-1/2 right-2.5 -translate-y-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-slate-100">
        <Input value={margin.right} onChange={(v) => onMarginChange("right", v)} />
      </div>

      {/* Padding Box */}
      <div className="absolute inset-8 border border-slate-200 rounded-lg bg-green-50/20 shadow-inner flex items-center justify-center pointer-events-none">
         <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1 bg-white text-[7px] font-black uppercase tracking-tighter text-green-500">Padding</div>
         
         {/* Center Element Placeholder */}
         <div className="w-12 h-6 bg-slate-100 border border-slate-200 rounded border-dashed flex items-center justify-center opacity-40">
           <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
         </div>
      </div>

      {/* Padding Inputs */}
      <div className="absolute top-8.5 left-1/2 -translate-x-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-green-100">
        <Input value={padding.top} onChange={(v) => onPaddingChange("top", v)} />
      </div>
      <div className="absolute bottom-8.5 left-1/2 -translate-x-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-green-100">
        <Input value={padding.bottom} onChange={(v) => onPaddingChange("bottom", v)} />
      </div>
      <div className="absolute top-1/2 left-8.5 -translate-y-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-green-100">
        <Input value={padding.left} onChange={(v) => onPaddingChange("left", v)} />
      </div>
      <div className="absolute top-1/2 right-8.5 -translate-y-1/2 w-6 h-4 bg-white/80 backdrop-blur rounded shadow-sm border border-green-100">
        <Input value={padding.right} onChange={(v) => onPaddingChange("right", v)} />
      </div>
    </div>
  );
}
