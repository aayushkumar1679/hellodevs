"use client";

import React from "react";
import { Layers, Grid3x3, Image as ImageIcon, Clock } from "lucide-react";

interface SidebarPanel {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
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
    { id: "components", label: "Components", icon: <Grid3x3 size={18} /> },
    { id: "layers", label: "Layers", icon: <Layers size={18} /> },
    { id: "assets", label: "Assets", icon: <ImageIcon size={18} /> },
    { id: "history", label: "History", icon: <Clock size={18} /> },
  ];

  return (
    <aside className="relative w-12 bg-gradient-to-b from-gray-900 to-gray-850 border-r border-gray-800 flex flex-col items-center py-2 gap-1">
      {panels.map((panel) => {
        const active = activePanel === panel.id;

        return (
          <div key={panel.id} className="relative group">
            {/* Active indicator bar */}
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-blue-400 rounded-full" />
            )}

            <button
              onClick={() => onPanelChange(active ? null : panel.id)}
              className={`relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-150 ${
                active
                  ? "bg-blue-400/15 text-blue-300"
                  : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-100"
              }`}
            >
              {panel.icon}

              {/* Count badge */}
              {panel.count && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {panel.count}
                </span>
              )}
            </button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="bg-gray-900 border border-gray-800 text-gray-200 text-[11px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {panel.label}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
