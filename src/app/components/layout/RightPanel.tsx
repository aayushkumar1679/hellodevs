"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import StylePanel from "../panels/StylePanel";
import SettingsPanel from "../panels/SettingsPanel";
import InteractionsPanel from "../panels/InteractionsPanel";
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
    <aside className="fixed right-0 top-[73px] bottom-0 flex w-[320px] flex-col border-l border-slate-200/80 bg-white/70 backdrop-blur-3xl z-40 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 p-2 pr-4">
        <div className="flex flex-1 p-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-[14px] py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                activeTab === tab.id
                  ? "bg-slate-950 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          title="Close Panel"
        >
          <X size={14} className="text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 custom-scrollbar">
        {activeTab === "style" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-6 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  Properties
                </p>
                <div className="h-px flex-1 bg-slate-100 ml-3" />
              </div>
              <StylePanel />
            </section>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-6">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  Settings
                </p>
                <div className="h-px flex-1 bg-slate-100 ml-3" />
              </div>
            <SettingsPanel />
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-6">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  Motion
                </p>
                <div className="h-px flex-1 bg-slate-100 ml-3" />
              </div>
            <InteractionsPanel />
          </div>
        )}
      </div>

      {!selectedElements.length && activeTab === "style" && (
        <div className="absolute inset-x-0 bottom-0 bg-amber-50/90 border-t border-amber-100 px-6 py-4 text-[11px] font-medium text-amber-700 backdrop-blur-sm">
          Select an element on the canvas to edit its properties.
        </div>
      )}
    </aside>
  );
}
