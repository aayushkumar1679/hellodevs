"use client";

import React from "react";
import {
  Sparkles,
  Grid3x3,
  Layers,
  Image as ImageIcon,
  Clock3,
} from "lucide-react";

interface SidebarPanel {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface LeftSidebarProps {
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
}

export default function LeftSidebar({
  activePanel,
  onPanelChange,
}: LeftSidebarProps) {
  const panels: SidebarPanel[] = [
    { id: "ai", label: "AI", icon: <Sparkles size={16} /> },
    { id: "components", label: "Components", icon: <Grid3x3 size={16} /> },
    { id: "layers", label: "Layers", icon: <Layers size={16} /> },
    { id: "assets", label: "Assets", icon: <ImageIcon size={16} /> },
    { id: "history", label: "History", icon: <Clock3 size={16} /> },
  ];

  return (
    <aside className="flex w-16 flex-col items-center gap-2 border-r border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-4 shadow-[inset_-1px_0_0_rgba(148,163,184,0.12)]">
      {panels.map((panel) => {
        const active = activePanel === panel.id;

        return (
          <div key={panel.id} className="relative group">
            <button
              onClick={() => onPanelChange(active ? null : panel.id)}
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_30px_-24px_rgba(15,23,42,0.9)]"
                  : "border-transparent bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {panel.icon}
            </button>

            <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-lg">
                {panel.label}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
