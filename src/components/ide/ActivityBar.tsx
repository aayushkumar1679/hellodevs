"use client";

import React from "react";
import {
  Folder,
  Search,
  LayoutGrid,
  Bot,
  Image as ImageIcon,
  Settings2,
} from "lucide-react";

export type ActivityPanelId =
  | "explorer"
  | "search"
  | "components"
  | "agent"
  | "assets"
  | null;

interface ActivityBarProps {
  activePanel: ActivityPanelId;
  setActivePanel: (id: ActivityPanelId) => void;
}

/* ─────────────────────────────────────────────────
   Panel definitions
   accent → icon color when active
───────────────────────────────────────────────── */
const PANELS: Array<{
  id: Exclude<ActivityPanelId, null>;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent: string;
}> = [
  { id: "explorer",   icon: Folder,      label: "Explorer",    accent: "var(--accent)"   },
  { id: "search",     icon: Search,      label: "Search",      accent: "var(--accent)"   },
  { id: "components", icon: LayoutGrid,  label: "Components",  accent: "var(--accent)"   },
  { id: "agent",      icon: Bot,         label: "AI Agent",    accent: "var(--accent-2)"  },
  { id: "assets",     icon: ImageIcon,   label: "Assets",      accent: "var(--accent)"   },
];

/* ─────────────────────────────────────────────────
   ActivityBar
   Width  : 44px  (--activity-bar-w)
   Bg     : --bg-void
   Active : left 2px --accent border + --accent-dim bg
            border-radius: 0 4px 4px 0 (flat left, rounded right)
───────────────────────────────────────────────── */
export default function ActivityBar({ activePanel, setActivePanel }: ActivityBarProps) {
  return (
    <aside
      className="flex h-full flex-shrink-0 flex-col items-center py-1 select-none"
      style={{
        width: "var(--activity-bar-w, 44px)",
        background: "var(--bg-void)",
        /* right border is rendered by IDEShell grid gutter */
      }}
    >
      {/* ── Nav Icons ─────────────────────────────── */}
      <div className="flex flex-col items-center gap-0.5 w-full px-1">
        {PANELS.map(({ id, icon: Icon, label, accent }) => {
          const isActive = activePanel === id;

          return (
            <button
              key={id}
              onClick={() => setActivePanel(isActive ? null : id)}
              title={label}
              className="relative flex items-center justify-center w-full transition-all duration-[120ms] active:scale-90"
              style={{
                height: 32,
                borderRadius: isActive ? "0 4px 4px 0" : 4,
                background: isActive ? "var(--accent-dim)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                color: isActive ? accent : "var(--text-3)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
                }
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* ── Spacer + Settings ─────────────────────── */}
      <div className="mt-auto px-1 w-full">
        <button
          title="Settings"
          className="flex items-center justify-center w-full transition-all duration-[120ms] active:scale-90"
          style={{ height: 32, borderRadius: 4, color: "var(--text-3)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-overlay)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
          }}
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
