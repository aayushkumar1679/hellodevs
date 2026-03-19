"use client";

import React from "react";
import {
  GitBranch,
  AlertCircle,
  AlertTriangle,
  Check,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEditorStore } from "@/state/useEditorStore";

/* ─────────────────────────────────────────────────
   StatusBar
   Height : 24px (--status-bar-h)
   Bg     : --bg-void
   Font   : 10px --font-mono --text-2
   Left   : git branch | errors | warnings
   Right  : agent status dot (pulsing --accent-2) | breakpoint
───────────────────────────────────────────────── */
export default function StatusBar() {
  const { activeBreakpoint } = useEditorStore();

  // Static placeholder values — wired to real stores elsewhere
  const errors:   number = 0;
  const warnings: number = 0;
  const isAgentBusy = false;
  const branchName  = "main";

  const BreakpointIcon =
    activeBreakpoint === "mobile"  ? Smartphone :
    activeBreakpoint === "tablet"  ? Tablet     :
    Monitor;

  return (
    <footer
      className="flex w-full flex-shrink-0 items-center justify-between select-none"
      style={{
        height: "var(--status-bar-h, 24px)",
        background: "var(--bg-void)",
        borderTop: "1px solid var(--border-dim)",
        paddingLeft: 12,
        paddingRight: 12,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: "var(--text-2)",
      }}
    >
      {/* ── LEFT ────────────────────────────────────── */}
      <div className="flex items-center" style={{ gap: 14 }}>

        {/* Git branch */}
        <button
          className="flex items-center gap-1 transition-colors duration-[120ms] hover:text-[var(--text-1)]"
          title="Switch branch"
        >
          <GitBranch className="h-3 w-3 flex-shrink-0" />
          <span>{branchName}</span>
        </button>

        {/* Errors */}
        <button
          className="flex items-center gap-1 transition-colors duration-[120ms] hover:text-[var(--text-1)]"
          title={`${errors} error${errors !== 1 ? "s" : ""}`}
          style={{ color: errors > 0 ? "var(--accent-3)" : undefined }}
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{errors}</span>
        </button>

        {/* Warnings */}
        <button
          className="flex items-center gap-1 transition-colors duration-[120ms] hover:text-[var(--text-1)]"
          title={`${warnings} warning${warnings !== 1 ? "s" : ""}`}
          style={{ color: warnings > 0 ? "var(--accent-4)" : undefined }}
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{warnings}</span>
        </button>
      </div>

      {/* ── RIGHT ───────────────────────────────────── */}
      <div className="flex items-center" style={{ gap: 14 }}>

        {/* Agent status */}
        <button
          className="flex items-center gap-1.5 transition-colors duration-[120ms] hover:text-[var(--text-1)]"
          title={isAgentBusy ? "Agent is running" : "Agent idle"}
        >
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{
              background: isAgentBusy ? "var(--accent-2)" : "var(--text-3)",
              animation: isAgentBusy ? "ai-pulse 1.4s ease-in-out infinite" : undefined,
            }}
          />
          <span>Agent: {isAgentBusy ? "Working…" : "Idle"}</span>
        </button>

        {/* Prettier / format check */}
        <button
          className="flex items-center gap-1 transition-colors duration-[120ms] hover:text-[var(--text-1)]"
          title="Formatter: Prettier"
        >
          <Check className="h-3 w-3 flex-shrink-0" style={{ color: "var(--accent-5)" }} />
          <span>Prettier</span>
        </button>

        {/* Breakpoint */}
        <button
          className="flex items-center gap-1 uppercase tracking-wide transition-colors duration-[120ms] hover:text-[var(--text-1)]"
          title={`Breakpoint: ${activeBreakpoint}`}
          style={{ letterSpacing: "0.06em" }}
        >
          <BreakpointIcon className="h-3 w-3 flex-shrink-0" />
          <span>{activeBreakpoint}</span>
        </button>
      </div>
    </footer>
  );
}
