"use client";

import React from "react";
import {
  Sparkles,
  Grid3x3,
  Layers,
  Image as ImageIcon,
  Clock3,
  Settings,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarPanel {
  id: string;
  label: string;
  icon: React.ElementType;
  accent?: string;
}

interface LeftSidebarProps {
  activeLeftPanel: string | null;
  setActiveLeftPanel: (panel: string | null) => void;
}

export default function LeftSidebar({
  activeLeftPanel,
  setActiveLeftPanel,
}: LeftSidebarProps) {
  const panels: SidebarPanel[] = [
    { id: "ai", label: "AI Studio", icon: Sparkles, accent: "#f59e0b" },
    { id: "components", label: "Library", icon: Grid3x3 },
    { id: "custom", label: "Custom", icon: Package },
    { id: "layers", label: "Layers", icon: Layers },
    { id: "assets", label: "Assets", icon: ImageIcon },
    { id: "history", label: "History", icon: Clock3 },
  ];

  return (
    <aside
      className="fixed left-0 z-40 flex flex-col items-center gap-1.5 border-r py-3"
      style={{
        top: "var(--header-h)",
        bottom: 0,
        width: "var(--left-sidebar-w)",
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {panels.map((panel, i) => {
        const Icon = panel.icon;
        const active = activeLeftPanel === panel.id;

        return (
          <motion.div
            key={panel.id}
            className="relative group"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
          >
            <motion.button
              onClick={() => setActiveLeftPanel(active ? null : panel.id)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
              style={{
                background: active
                  ? panel.accent
                    ? `${panel.accent}22`
                    : "rgba(255,255,255,0.1)"
                  : "transparent",
                color: active
                  ? panel.accent || "rgba(255,255,255,0.95)"
                  : "var(--sidebar-icon)",
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              title={panel.label}
            >
              <Icon
                size={15}
                style={{
                  color: active
                    ? panel.accent || "rgba(255,255,255,0.95)"
                    : undefined,
                  filter: active && panel.accent
                    ? `drop-shadow(0 0 6px ${panel.accent}88)`
                    : undefined,
                }}
              />

              {/* Active indicator bar */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{
                      background: panel.accent || "rgba(255,255,255,0.85)",
                      boxShadow: panel.accent
                        ? `0 0 8px ${panel.accent}88`
                        : "0 0 8px rgba(255,255,255,0.4)",
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Hover Tooltip */}
            <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 z-50">
              <div
                className="whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-xl"
                style={{ background: "rgba(15,15,17,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {panel.label}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[6px]"
                  style={{ borderRightColor: "rgba(15,15,17,0.95)" }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Spacer + Settings */}
      <div className="mt-auto">
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
          style={{ color: "var(--sidebar-icon)" }}
          whileHover={{ scale: 1.08, color: "rgba(255,255,255,0.8)" }}
          whileTap={{ scale: 0.9 }}
          title="Settings"
        >
          <Settings size={14} />
        </motion.button>
      </div>
    </aside>
  );
}
