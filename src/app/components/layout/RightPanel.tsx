"use client";

import React, { useState } from "react";
import { X, Palette, Settings2, Zap, Layers, Box } from "lucide-react";
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
  onClose?: () => void;
}

type Tab = "content" | "style" | "motion" | "tokens" | "settings";

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "content", icon: Box, label: "Content" },
  { id: "style", icon: Palette, label: "Style" },
  { id: "motion", icon: Zap, label: "Motion" },
  { id: "tokens", icon: Layers, label: "Tokens" },
  { id: "settings", icon: Settings2, label: "Settings" },
];

export default function RightPanel({ onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("style");

  const selectedElements = useEditorStore((s) => s.selectedElements ?? []);
  const currentProject = useProjectStore((s) => s.currentProject);

  // Auto-switch on element type
  React.useEffect(() => {
    if (selectedElements.length === 1) {
      const type = currentProject?.components[selectedElements[0]]?.type ?? "";
      const textTypes = [
        "text",
        "heading1",
        "heading2",
        "heading3",
        "heading",
        "button",
        "paragraph",
      ];
      setActiveTab(textTypes.includes(type) ? "content" : "style");
    }
  }, [selectedElements, currentProject]);

  return (
    <aside className="relative flex h-full w-full flex-col bg-[#0f1016]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.16),transparent_45%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.12),transparent_55%)] opacity-80" />
      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="flex h-8 flex-shrink-0 items-center border-b border-white/[0.06] px-1.5 gap-0.5">
        {TABS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={label}
              className={`relative flex h-6 flex-1 items-center justify-center gap-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-150 ${
                active
                  ? "bg-white/[0.09] text-white"
                  : "text-white/25 hover:bg-white/[0.04] hover:text-white/50"
              }`}
            >
              <Icon className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="hidden xl:inline">{label}</span>
              {active && (
                <motion.div
                  layoutId="right-tab-indicator"
                  className="absolute inset-0 rounded-md bg-white/[0.09]"
                  transition={{ duration: 0.15 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </button>
          );
        })}

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-white/20 transition hover:bg-white/[0.06] hover:text-white/50"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Panel content ──────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.12 }}
            className="p-2.5"
          >
            {activeTab === "content" && (
              <div className="space-y-3">
                <SectionLabel>Content</SectionLabel>
                <PropertyPanel />
                <div className="my-2 h-px bg-white/[0.06]" />
                <ElementInspector />
              </div>
            )}
            {activeTab === "style" && <StylePanel />}
            {activeTab === "motion" && <InteractionsPanel />}
            {activeTab === "tokens" && <DesignSystemPanel />}
            {activeTab === "settings" && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── No selection hint ─────────────────────────── */}
      {!selectedElements.length && activeTab === "style" && (
        <div className="flex-shrink-0 border-t border-amber-500/10 bg-amber-500/5 px-3 py-2 text-[9px] font-semibold uppercase tracking-widest text-amber-500/50">
          ↑ Click a layer to inspect
        </div>
      )}
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
      {children}
    </p>
  );
}
