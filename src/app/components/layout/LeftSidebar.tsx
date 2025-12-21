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
    <aside className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2 gap-1">
      {panels.map((panel) => (
        <button
          key={panel.id}
          onClick={() =>
            onPanelChange(activePanel === panel.id ? null : panel.id)
          }
          className={`relative p-2.5 rounded-lg transition-colors ${
            activePanel === panel.id
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
          title={panel.label}
        >
          {panel.icon}
          {panel.count && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {panel.count}
            </span>
          )}
        </button>
      ))}
    </aside>
  );
}
