"use client";

import React, { useState } from "react";
import { Folder, Search, Grid3x3, Sparkles, Image as ImageIcon, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ActivityPanelId = "explorer" | "search" | "components" | "agent" | "assets" | null;

interface ActivityBarProps {
  activePanel: ActivityPanelId;
  setActivePanel: (id: ActivityPanelId) => void;
}

const PANELS = [
  { id: "explorer" as const, icon: Folder, label: "Explorer", accent: "var(--accent-primary)" },
  { id: "search" as const, icon: Search, label: "Search", accent: "var(--accent-primary)" },
  { id: "components" as const, icon: Grid3x3, label: "Components", accent: "var(--accent-primary)" },
  { id: "agent" as const, icon: Sparkles, label: "AI Agent", accent: "var(--accent-secondary)" },
  { id: "assets" as const, icon: ImageIcon, label: "Assets", accent: "var(--accent-primary)" },
];

export default function ActivityBar({ activePanel, setActivePanel }: ActivityBarProps) {
  return (
    <aside className="flex h-full w-[40px] flex-shrink-0 flex-col items-center gap-1 border-r border-[var(--border-subtle)] bg-[var(--bg-base)] py-2 select-none">
      {PANELS.map(({ id, icon: Icon, label, accent }, i) => {
        const isActive = activePanel === id;
        return (
          <motion.div
            key={id}
            className="group relative z-10"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <motion.button
              onClick={() => setActivePanel(isActive ? null : id)}
              whileTap={{ scale: 0.88 }}
              title={label}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${
                isActive
                  ? "text-white bg-white/5"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5"
              }`}
            >
              <Icon
                className="h-4 w-4"
                style={isActive ? { color: accent } : undefined}
              />

              {/* Active pill on left edge */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activity-active-pill"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -left-[5px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full"
                    style={{ background: accent }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        );
      })}

      {/* Spacer + Settings */}
      <div className="mt-auto">
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-white/5 hover:text-[var(--text-secondary)]"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </motion.button>
      </div>
    </aside>
  );
}
