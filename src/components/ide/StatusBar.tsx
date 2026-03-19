"use client";

import React from "react";
import { GitBranch, AlertCircle, AlertTriangle, Check, Monitor } from "lucide-react";
import { useEditorStore } from "@/state/useEditorStore";

export default function StatusBar() {
  const { activeBreakpoint } = useEditorStore();
  
  // Example dummy states for now
  const errors = 0;
  const warnings = 0;
  const isAgentIdle = true;
  const branchName = "main";
  
  return (
    <footer className="flex h-[24px] w-full flex-shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 text-[11px] text-[var(--text-secondary)] select-none">
      <div className="flex items-center gap-4 h-full">
        {/* Git Branch */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          <GitBranch className="h-3 w-3" />
          <span>{branchName}</span>
        </div>

        {/* Errors & Warnings */}
        <div className="flex items-center gap-3 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          <div className={`flex items-center gap-1 transition-colors ${errors > 0 ? "text-[var(--accent-error)]" : ""}`}>
            <AlertCircle className="h-3 w-3" />
            <span>{errors}</span>
          </div>
          <div className={`flex items-center gap-1 transition-colors ${warnings > 0 ? "text-[var(--accent-warning)]" : ""}`}>
            <AlertTriangle className="h-3 w-3" />
            <span>{warnings}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 h-full">
        {/* Agent Status */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          <div className={`h-1.5 w-1.5 rounded-full ${isAgentIdle ? "bg-[var(--text-muted)]" : "bg-[var(--accent-secondary)] animate-pulse"}`} />
          <span>Agent: {isAgentIdle ? "Idle" : "Working..."}</span>
        </div>

        {/* Prettier / Type Checking */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          <Check className="h-3 w-3" />
          <span>Prettier</span>
        </div>

        {/* Viewport Size / Breakpoint */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider text-[9px] font-bold">
          <Monitor className="h-3 w-3" />
          <span>{activeBreakpoint}</span>
        </div>
      </div>
    </footer>
  );
}
