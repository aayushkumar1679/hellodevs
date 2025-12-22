"use client";

import React, { useState } from "react";
import StylePanel from "../panels/StylePanel";
import SettingsPanel from "../panels/SettingsPanel";
import InteractionsPanel from "../panels/InteractionsPanel";
import ElementInspector from "../panels/ElementInspector";
import { useDesignStore } from "@/state/useDesignStore";
import { X } from "lucide-react";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "style" | "settings" | "interactions";

export default function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("style");
  const selectedElements = useDesignStore((state) => state.selectedElements);

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gradient-to-b from-gray-900 to-gray-850 border-l border-gray-800 flex flex-col h-full shadow-lg">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between h-14 border-b border-gray-800 px-3 bg-gradient-to-r from-gray-900 to-gray-850">
        <div className="flex gap-1">
          {[
            { id: "style", label: "Style" },
            { id: "settings", label: "Settings" },
            { id: "interactions", label: "Interactions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                activeTab === tab.id
                  ? "bg-blue-400 text-gray-100 shadow-lg shadow-blue-400/20"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800/80 rounded-sm transition-colors text-gray-400 hover:text-gray-100"
          title="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {selectedElements.length === 0 && activeTab === "style" && (
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
          <p className="text-xs text-gray-400">
            👈 Select an element from canvas to edit styles
          </p>
        </div>
      )}

      {/* Content Area - Split Layout for Style Tab */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-900 to-gray-850 flex flex-col">
        {activeTab === "style" && (
          <>
            {/* Element Inspector - Top Section */}
            <div className="flex-shrink-0 border-b border-gray-800 overflow-y-auto max-h-[200px]">
              <ElementInspector />
            </div>

            {/* Style Panel - Bottom Section */}
            <div className="flex-1 overflow-y-auto">
              <StylePanel />
            </div>
          </>
        )}
        {activeTab === "settings" && <SettingsPanel />}
        {activeTab === "interactions" && <InteractionsPanel />}
      </div>
    </div>
  );
}
