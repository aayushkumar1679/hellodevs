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
    { id: "components", label: "Components", icon: <Grid3x3 size={16} /> },
    { id: "layers", label: "Layers", icon: <Layers size={16} /> },
    { id: "assets", label: "Assets", icon: <ImageIcon size={16} /> },
    { id: "history", label: "History", icon: <Clock size={16} /> },
  ];

  return (
    <aside
      className="relative w-12 flex flex-col items-center gap-1 py-2
      border-r border-white/5
      bg-[linear-gradient(180deg,#020617_0%,#020617_100%)]
      backdrop-blur"
    >
      {panels.map((panel) => {
        const active = activePanel === panel.id;

        return (
          <div key={panel.id} className="relative group">
            {/* Active indicator */}
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full transition-opacity
                ${active ? "bg-blue-400 opacity-100" : "opacity-0"}`}
            />

            <button
              onClick={() => onPanelChange(active ? null : panel.id)}
              className={`relative flex items-center justify-center
                w-9 h-9 rounded-md
                transition-colors duration-150
                ${
                  active
                    ? "bg-blue-500/15 text-blue-300"
                    : "text-gray-400 hover:bg-white/10 hover:text-gray-100"
                }`}
            >
              {panel.icon}

              {/* Count badge */}
              {panel.count !== undefined && panel.count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5
                  w-4 h-4 rounded-full
                  bg-red-500 text-white text-[9px] font-semibold
                  flex items-center justify-center
                  shadow-md"
                >
                  {panel.count}
                </span>
              )}
            </button>

            {/* Tooltip */}
            <div
              className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2
              opacity-0 translate-x-1
              group-hover:opacity-100 group-hover:translate-x-0
              transition-all duration-150 ease-out"
            >
              <div
                className="px-2 py-1 rounded-md text-[11px] whitespace-nowrap
                border border-white/10
                bg-[#020617]
                text-gray-200 shadow-xl"
              >
                {panel.label}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
