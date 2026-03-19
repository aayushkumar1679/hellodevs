import React from "react";
import { useAgentStore } from "@/state/useAgentStore";
import { Bot, TerminalSquare, Code, LayoutDashboard } from "lucide-react";

export default function AgentManager() {
  const { mode, setMode } = useAgentStore();

  const modes = [
    { id: "design", icon: LayoutDashboard, label: "Design Gen" },
    { id: "code", icon: Code, label: "Code Gen" },
    { id: "architect", icon: Bot, label: "AI Architect" },
    { id: "screenshot", icon: TerminalSquare, label: "Vision-to-Code" }
  ] as const;

  return (
    <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
        Agent Mode
      </p>
      <div className="flex flex-col gap-1.5">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === m.id
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-white border border-transparent"
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
