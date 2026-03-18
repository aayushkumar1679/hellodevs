"use client";

import React from "react";
import {
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  Layout,
  MessageSquare,
} from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPanel() {
  const { history, currentProject, undo } = useProjectStore();
  const snapshots = history || [];

  if (!currentProject) return null;

  return (
    <div className="flex h-full flex-col bg-[#0b0b0f] text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-violet-400" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
            History
          </h2>
        </div>
        <div className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold text-violet-400 border border-violet-500/20">
          {snapshots.length} Snapshots
        </div>
      </div>

      {/* History List */}
      <div
        className="flex-1 overflow-y-auto p-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        {snapshots.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <History className="h-5 w-5 text-white/10" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              No History Yet
            </p>
            <p className="mt-1 text-[9px] text-white/10 max-w-[120px]">
              Changes will appear here as you build.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...snapshots].reverse().map((snapshot, revIdx) => {
              const idx = snapshots.length - 1 - revIdx;
              const isLatest = revIdx === 0;
              const isAI = snapshot.generationPrompt !== undefined;
              const time = formatDistanceToNow(new Date(), { addSuffix: true });

              return (
                <div
                  key={idx}
                  className={`group relative rounded-xl border p-3 transition-all ${
                    isLatest
                      ? "border-violet-500/30 bg-violet-500/5 shadow-[0_8px_24px_-12px_rgba(124,58,237,0.3)]"
                      : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`text-[8px] font-black uppercase tracking-widest ${isLatest ? "text-violet-400" : "text-white/20"}`}
                      >
                        {isLatest
                          ? "Current"
                          : `Snapshot #${snapshots.length - idx}`}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold text-white/50">
                        {isAI ? "AI Generation" : "Manual Edit"}
                      </p>
                      <p className="text-[9px] text-white/20">{time}</p>
                    </div>
                    {idx > 0 && (
                      <button
                        onClick={() => {
                          for (let i = 0; i < revIdx; i++) undo();
                        }}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/25 opacity-0 transition-all group-hover:opacity-100 hover:bg-violet-600/20 hover:text-violet-400"
                        title="Restore this version"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  {isAI && snapshot.generationPrompt && (
                    <p className="mt-1.5 truncate rounded-md bg-white/[0.04] px-2 py-1 text-[9px] italic text-white/30">
                      &ldquo;{snapshot.generationPrompt}&rdquo;
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 border-t border-white/[0.04] pt-2">
                    <div className="flex items-center gap-1 text-[9px] text-white/30">
                      <Layout className="h-2.5 w-2.5" />
                      {Object.keys(snapshot.components).length} Elements
                    </div>
                    {isAI && (
                      <div className="flex items-center gap-1 text-[9px] text-violet-400/50">
                        <MessageSquare className="h-2.5 w-2.5" />
                        AI Pipeline
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-center py-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/[0.05]" />
              <div className="mx-3 flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500/50" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/20">
                  History Origin
                </span>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/[0.05]" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/[0.06] bg-black/20 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/10 bg-amber-500/5 px-2.5 py-2">
          <AlertCircle className="h-3 w-3 text-amber-500/50" />
          <p className="text-[9px] leading-relaxed text-amber-500/60">
            Snapshots are stored per session. Persistent versioning is coming
            soon to Polyglot.
          </p>
        </div>
      </div>
    </div>
  );
}
