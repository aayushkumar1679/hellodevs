"use client";

import React from "react";
import { Clock3, RotateCcw, Sparkles, User } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";

export default function HistoryPanel() {
  const { history } = useProjectStore();
  const snapshots = [...history].reverse();

  if (snapshots.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-[#111114]">
        <Clock3 className="mb-3 h-8 w-8 text-white/10" />
        <p className="text-[10px] font-semibold text-white/30">
          No history yet
        </p>
        <p className="mt-1 text-[9px] leading-5 text-white/15">
          Make edits to start building your timeline. Ctrl+Z to undo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#111114] text-white">
      <div className="flex-shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
          History
        </p>
        <p className="mt-0.5 text-[8px] text-white/15">
          {snapshots.length} snapshots
        </p>
      </div>

      <div
        className="relative flex-1 overflow-y-auto p-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-3 bottom-3 w-px bg-white/[0.06]" />

        <div className="space-y-2">
          {snapshots.slice(0, 20).map((snapshot, idx) => {
            const isAI = !!snapshot.generationPrompt;
            const isLatest = idx === 0;
            const time = snapshot.updatedAt
              ? new Date(snapshot.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "–";

            return (
              <div
                key={`${snapshot.id}-${idx}`}
                className="group relative flex gap-3 pl-6"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 z-10 ${
                    isLatest
                      ? "border-violet-500/50 bg-violet-600/20 text-violet-400"
                      : "border-white/[0.08] bg-[#111114] text-white/20"
                  }`}
                >
                  {isAI ? (
                    <Sparkles className="h-2.5 w-2.5" />
                  ) : (
                    <User className="h-2.5 w-2.5" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded-xl border p-2.5 transition-all hover:border-white/10 ${isLatest ? "border-violet-500/15 bg-violet-500/6" : "border-white/[0.05] bg-white/[0.02]"}`}
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
                          for (let i = 0; i < idx; i++)
                            useProjectStore.getState().undo();
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
                </div>
              </div>
            );
          })}
        </div>

        {snapshots.length > 20 && (
          <p className="mt-3 pl-6 text-[9px] italic text-white/20">
            +{snapshots.length - 20} more snapshots
          </p>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-white/[0.06] px-3 py-2">
        <p className="text-[9px] text-white/20">
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 font-mono text-[8px] text-white/30">
            Ctrl+Z
          </kbd>{" "}
          steps back through snapshots
        </p>
      </div>
    </div>
  );
}
