"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import StylePanel from "../panels/StylePanel";
import SettingsPanel from "../panels/SettingsPanel";
import InteractionsPanel from "../panels/InteractionsPanel";
import ElementInspector from "../panels/ElementInspector";
import { useDesignStore } from "@/state/useDesignStore";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "style" | "settings" | "interactions";

export default function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("style");
  const selectedElements = useDesignStore((state) => state.selectedElements || []);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "style", label: "Style" },
    { id: "settings", label: "Settings" },
    { id: "interactions", label: "Interactions" },
  ];

  return (
    <aside
      className="flex h-full w-[22rem] flex-shrink-0 flex-col border-l border-slate-200 bg-white/88 shadow-[-24px_0_60px_-48px_rgba(15,23,42,0.35)] backdrop-blur-xl"
      role="complementary"
      aria-label="Inspector"
    >
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Inspector
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              Refine the selected layer
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
            title="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        <div role="tablist" aria-label="Inspector tabs" className="mt-4 flex gap-2">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedElements.length === 0 && activeTab === "style" && (
        <div className="border-b border-slate-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Select an element on the canvas to unlock styling controls.
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab === "style" && (
          <>
            <div className="max-h-[220px] flex-shrink-0 overflow-auto border-b border-slate-200 bg-slate-50/60 px-3 py-3">
              <ElementInspector />
            </div>

            <div className="flex-1 overflow-auto">
              <StylePanel />
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <div className="flex-1 overflow-auto px-3 py-3">
            <SettingsPanel />
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="flex-1 overflow-auto px-3 py-3">
            <InteractionsPanel />
          </div>
        )}
      </div>
    </aside>
  );
}
