"use client";

import React from "react";
import {
  Sparkles,
  Grid3x3,
  Layers,
  Image as ImageIcon,
  Clock3,
  Package,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LeftPanelId =
  | "ai"
  | "components"
  | "custom"
  | "layers"
  | "assets"
  | "history"
  | null;

interface LeftSidebarProps {
  activeLeftPanel: LeftPanelId;
  setActiveLeftPanel: (id: LeftPanelId) => void;
  width?: number;
}

const PANELS = [
  { id: "ai" as const, icon: Sparkles, label: "AI Studio", accent: "#a78bfa" },
  {
    id: "components" as const,
    icon: Grid3x3,
    label: "Components",
    accent: null,
  },
  { id: "custom" as const, icon: Package, label: "Custom", accent: null },
  { id: "layers" as const, icon: Layers, label: "Layers", accent: null },
  { id: "assets" as const, icon: ImageIcon, label: "Assets", accent: null },
  { id: "history" as const, icon: Clock3, label: "History", accent: null },
];

export default function LeftSidebar({
  activeLeftPanel,
  setActiveLeftPanel,
}: LeftSidebarProps) {
  return (
    /*
     * This sidebar is a plain flex child — NOT fixed.
     * It sits in the flex row alongside the canvas.
     * Width is w-10 (40px) — just the icon strip.
     */
    <aside className="flex h-full w-10 flex-shrink-0 flex-col items-center gap-1 border-r border-white/[0.06] bg-[#0A0A0D] py-2">
      {PANELS.map(({ id, icon: Icon, label, accent }, i) => {
        const active = activeLeftPanel === id;
        return (
          <motion.div
            key={id}
            className="group relative"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <motion.button
              onClick={() => setActiveLeftPanel(active ? null : id)}
              whileTap={{ scale: 0.88 }}
              title={label}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${
                active
                  ? "bg-white/[0.10] text-white"
                  : "text-white/30 hover:bg-white/[0.05] hover:text-white/60"
              }`}
            >
              <Icon
                className="h-3.5 w-3.5"
                style={
                  active && accent
                    ? {
                        color: accent,
                        filter: `drop-shadow(0 0 5px ${accent}99)`,
                      }
                    : undefined
                }
              />

              {/* Active pill on left edge */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="left-active-pill"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -left-[9px] top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full"
                    style={{
                      background: accent ?? "rgba(255,255,255,0.7)",
                      boxShadow: `0 0 6px ${accent ?? "rgba(255,255,255,0.4)"}`,
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Tooltip */}
            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 translate-x-1 opacity-0 transition-all duration-100 group-hover:translate-x-0 group-hover:opacity-100">
              <div className="whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#1C1C20] px-2.5 py-1 text-[10px] font-semibold text-white/80 shadow-xl">
                {label}
                <div
                  className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[5px]"
                  style={{ borderRightColor: "#1C1C20" }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Spacer + settings */}
      <div className="mt-auto">
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 transition hover:bg-white/[0.05] hover:text-white/50"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </aside>
  );
}
