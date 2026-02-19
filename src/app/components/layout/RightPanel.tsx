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
  const selectedElements = useDesignStore(
    (state) => state.selectedElements || []
  );

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "style", label: "Style" },
    { id: "settings", label: "Settings" },
    { id: "interactions", label: "Interactions" },
  ];

  return (
    <aside
      className="w-80 flex-shrink-0 flex flex-col h-full border-l border-white/5
                 bg-[linear-gradient(180deg,#020617_0%,#040810_100%)] shadow-lg"
      role="complementary"
      aria-label="Inspector"
    >
      {/* Header (tabs + close) */}
      <div
        className="h-14 flex items-center justify-between px-3 border-b border-white/5
                   bg-[linear-gradient(90deg,#020617_0%,#041022_100%)]"
      >
        <div role="tablist" aria-label="Inspector tabs" className="flex gap-1">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition
                  ${
                    active
                      ? "bg-blue-500/15 text-blue-300 shadow-[0_6px_18px_rgba(59,130,246,0.06)]"
                      : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-100 hover:bg-white/5 transition"
            title="Close panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Empty selection hint for Style tab */}
      {selectedElements.length === 0 && activeTab === "style" && (
        <div className="px-4 py-3 bg-white/2 border-b border-white/3">
          <p className="text-xs text-gray-400">
            👈 Select an element on the canvas to edit styles
          </p>
        </div>
      )}

      {/* Content - scrollable areas with clear boundaries */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Style Tab splits: ElementInspector (top) + StylePanel (scroll) */}
        {activeTab === "style" && (
          <>
            <div
              id="panel-style"
              role="tabpanel"
              aria-labelledby="tab-style"
              className="flex-shrink-0 border-b border-white/5 max-h-[220px] overflow-auto"
            >
              <div className="px-3 py-2">
                <ElementInspector />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="px-3 py-3">
                <StylePanel />
              </div>
            </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div
            id="panel-settings"
            role="tabpanel"
            aria-labelledby="tab-settings"
            className="flex-1 overflow-auto px-3 py-3"
          >
            <SettingsPanel />
          </div>
        )}

        {/* Interactions Tab */}
        {activeTab === "interactions" && (
          <div
            id="panel-interactions"
            role="tabpanel"
            aria-labelledby="tab-interactions"
            className="flex-1 overflow-auto px-3 py-3"
          >
            <InteractionsPanel />
          </div>
        )}
      </div>
    </aside>
  );
}
