"use client";

import React from "react";
import {
  Sparkles,
  Grid3x3,
  Layers,
  Image as ImageIcon,
  Clock3,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarPanel {
  id: string;
  label: string;
  icon: React.ElementType;
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
    { id: "ai", label: "AI Generator", icon: Sparkles },
    { id: "components", label: "Library", icon: Grid3x3 },
    { id: "layers", label: "Layers", icon: Layers },
    { id: "assets", label: "Media", icon: ImageIcon },
    { id: "history", label: "History", icon: Clock3 },
  ];

  return (
    <aside className="fixed left-0 top-[73px] bottom-0 flex w-20 flex-col items-center gap-5 border-r border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-6 shadow-[inset_-1px_0_0_rgba(148,163,184,0.12)] z-40">
      {panels.map((panel) => {
        const Icon = panel.icon;
        const active = activeLeftPanel === panel.id;

        return (
          <div key={panel.id} className="relative group">
            <motion.button
              layout
              onClick={() => setActiveLeftPanel(active ? null : panel.id)}
              className={`relative flex h-12 w-12 items-center justify-center rounded-[20px] border transition-all duration-300 ${
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_15px_30px_-12px_rgba(15,23,42,0.4)]"
                  : "border-transparent bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 hover:shadow-sm"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon size={20} className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
              
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-950 rounded-r-full shadow-[0_0_15px_rgba(15,23,42,0.3)]"
                  />
                )}
              </AnimatePresence>
            </motion.button>

            <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 z-50">
              <div className="rounded-xl border border-slate-950 bg-slate-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl whitespace-nowrap">
                {panel.label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-950" />
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-auto">
        <button className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white text-slate-400 border border-transparent transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950">
          <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}
