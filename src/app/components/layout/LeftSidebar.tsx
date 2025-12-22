"use client";

import React from "react";
import { Layers, Grid3x3, Image, Clock } from "lucide-react";

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
    { id: "components", label: "Components", icon: <Grid3x3 size={20} /> },
    { id: "layers", label: "Layers", icon: <Layers size={20} /> },
    { id: "assets", label: "Assets", icon: <Image size={20} /> },
    { id: "history", label: "History", icon: <Clock size={20} /> },
  ];

  return (
    <aside className="w-12 bg-gradient-to-b from-gray-900 to-gray-850 border-r border-gray-800 flex flex-col items-center py-2 gap-1">
      {panels.map((panel) => (
        <button
          key={panel.id}
          onClick={() =>
            onPanelChange(activePanel === panel.id ? null : panel.id)
          }
          className={`relative p-2.5 rounded-sm transition-all ${
            activePanel === panel.id
              ? "bg-blue-400 text-gray-100 shadow-lg shadow-blue-400/20"
              : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-100"
          }`}
          title={panel.label}
        >
          {panel.icon}
          {panel.count && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
              {panel.count}
            </span>
          )}
        </button>
      ))}
    </aside>
  );
}
