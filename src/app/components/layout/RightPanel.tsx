"use client";

import React, { useState } from "react";
import { X, Palette, Settings2, Zap } from "lucide-react";
import StylePanel from "../panels/StylePanel";
import SettingsPanel from "../panels/SettingsPanel";
import InteractionsPanel from "../panels/InteractionsPanel";
import { useDesignStore } from "@/state/useDesignStore";
import { motion, AnimatePresence } from "framer-motion";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "style" | "settings" | "interactions";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "style", label: "Style", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "interactions", label: "Motion", icon: Zap },
];

export default function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("style");
  const selectedElements = useDesignStore((state) => state.selectedElements || []);

  if (!isOpen) return null;

  return (
    <aside
      className="fixed right-0 z-40 flex flex-col border-l bg-white/90 backdrop-blur-2xl"
      style={{
        top: "var(--header-h)",
        bottom: 0,
        width: "var(--right-panel-w)",
        borderColor: "rgba(226,232,240,0.6)",
      }}
    >
      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 border-b border-slate-100 px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 ${
                active
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon size={10} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={onClose}
          className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={12} />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="p-3"
            >
              <StylePanel />
            </motion.div>
          )}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="p-3"
            >
              <SettingsPanel />
            </motion.div>
          )}
          {activeTab === "interactions" && (
            <motion.div
              key="interactions"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="p-3"
            >
              <InteractionsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty state hint */}
      {!selectedElements.length && activeTab === "style" && (
        <div className="border-t border-amber-100 bg-amber-50/70 px-3 py-2.5 text-[10px] font-medium text-amber-600">
          ↑ Select an element on the canvas
        </div>
      )}
    </aside>
  );
}
