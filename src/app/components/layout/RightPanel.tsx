"use client";

import React, { useState } from "react";
import StylePanel from "../panels/StylePanel";
import SettingsPanel from "../panels/SettingsPanel";
import InteractionsPanel from "../panels/InteractionsPanel";
import { X } from "lucide-react";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "style" | "settings" | "interactions";

export default function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("style");

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between h-10 border-b border-gray-700 px-3">
        <div className="flex gap-1">
          {[
            { id: "style", label: "Style" },
            { id: "settings", label: "Settings" },
            { id: "interactions", label: "Interactions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "style" && <StylePanel />}
        {activeTab === "settings" && <SettingsPanel />}
        {activeTab === "interactions" && <InteractionsPanel />}
      </div>
    </div>
  );
}
