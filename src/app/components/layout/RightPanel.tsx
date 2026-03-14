"use client";

import React, { useState } from "react";
import { X, Palette, Settings2, Zap, Layers } from "lucide-react";
import StylePanel from "../panels/StylePanel";
import SettingsPanel from "../panels/SettingsPanel";
import InteractionsPanel from "../panels/InteractionsPanel";
import PropertyPanel from "../panels/PropertyPanel";
import ElementInspector from "../panels/ElementInspector";
import DesignSystemPanel from "../panels/DesignSystemPanel";
import { useEditorStore } from "@/state/useEditorStore";
import { useProjectStore } from "@/state/useProjectStore";
import { motion, AnimatePresence } from "framer-motion";

interface RightPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type Tab = "content" | "style" | "settings" | "interactions" | "design-system";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "content", label: "Content", icon: Settings2 },
  { id: "style", label: "Style", icon: Palette },
  { id: "interactions", label: "Motion", icon: Zap },
  { id: "design-system", label: "Tokens", icon: Layers },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export default function RightPanel({ isOpen = true, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("style");
  const selectedElements = useEditorStore((state) => state.selectedElements || []);
  const currentProject = useProjectStore((state) => state.currentProject);

  // Auto-switch to content tab when selecting a text/interactive element
  React.useEffect(() => {
    if (selectedElements.length === 1) {
      const component = currentProject?.components[selectedElements[0]];
      const type = component?.type;
      if (type === "text" || type === "heading1" || type === "heading2" || type === "heading3" || type === "button" || type === "paragraph") {
        setActiveTab("content");
      } else {
        setActiveTab("style");
      }
    }
  }, [selectedElements, currentProject]);

  if (!isOpen) return null;

  // If onClose is provided, it's likely a mobile slide-over or a toggleable sidebar
  // If not, it's an embedded panel in the resizable layout
  const isFixed = !!onClose;

  return (
    <aside
      className={`${isFixed ? "fixed right-0 z-40" : "relative flex-1"} flex flex-col border-l bg-white/95 backdrop-blur-2xl h-full`}
      style={{
        top: isFixed ? "var(--header-h)" : 0,
        bottom: 0,
        width: isFixed ? "var(--right-panel-w)" : "100%",
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
          {activeTab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="p-3 space-y-4"
            >
              <PropertyPanel />
              <hr className="border-slate-100" />
              <ElementInspector />
            </motion.div>
          )}
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
          {activeTab === "design-system" && (
            <motion.div
              key="design-system"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="p-3"
            >
              <DesignSystemPanel />
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
