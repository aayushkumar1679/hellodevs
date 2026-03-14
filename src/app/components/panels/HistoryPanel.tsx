"use client";

import React from "react";
import { Clock3, RotateCcw, Sparkles, User, History as HistoryIcon } from "lucide-react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
export default function HistoryPanel() {
  const { history } = useCanvasStore();


  const snapshots = [...history].reverse();

  if (snapshots.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-50 text-slate-300 shadow-inner">
          <Clock3 className="h-6 w-6" />
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-900">No history yet</p>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          Make some edits to the canvas or styles to start building your project timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg">
            <HistoryIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Timeline
            </p>
            <h3 className="text-sm font-semibold text-slate-950">Project History</h3>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          We automatically save snapshots of your design and structure as you work.
        </p>
      </header>

      <div className="relative space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />

        {snapshots.slice(0, 15).map((snapshot, idx) => {
          const isAI = !!snapshot.generationPrompt;
          const time = snapshot.updatedAt ? new Date(snapshot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently";
          
          return (
            <div key={`${snapshot.id}-${idx}`} className="relative pl-10">
              {/* Dot */}
              <div className={`absolute left-0 h-10 w-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 ${
                idx === 0 ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {isAI ? <Sparkles className="h-3 w-3" /> : <User className="h-3 w-3" />}
              </div>

              <div className={`group rounded-[24px] border p-4 transition-all hover:bg-white hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.15)] ${
                idx === 0 ? "border-sky-100 bg-sky-50/30" : "border-slate-100 bg-white/50"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      idx === 0 ? "text-sky-600" : "text-slate-400"
                    }`}>
                      {idx === 0 ? "Latest Snapshot" : `Snapshot #${snapshots.length - idx}`}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-900">
                      {isAI ? "AI Generation" : "Manual Edit"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{time}</p>
                  </div>
                  
                  {idx > 0 && (
                     <button
                       onClick={() => {
                         // Roll back the history by calling undo multiple times
                         for (let i = 0; i < idx; i++) {
                           useCanvasStore.getState().undo();
                         }
                       }}
                       className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition hover:bg-slate-800"
                       title="Restore this version"
                     >
                       <RotateCcw className="h-3.5 w-3.5" />
                     </button>
                  )}
                </div>

                {isAI && snapshot.generationPrompt && (
                   <div className="mt-3 rounded-xl bg-white/60 p-2.5 text-[10px] italic text-slate-600 border border-slate-100 truncate">
                     &quot;{snapshot.generationPrompt}&quot;
                   </div>
                )}
              </div>
            </div>
          );
        })}

        {snapshots.length > 15 && (
           <p className="pl-10 text-[10px] font-medium text-slate-400 italic">
             + {snapshots.length - 15} more snapshots in this session
           </p>
        )}
      </div>

      <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 p-4">
        <p className="text-[10px] leading-5 text-slate-500">
          Tip: Use <kbd className="rounded border bg-white px-1 py-0.5 font-sans text-slate-900 font-semibold shadow-sm text-[10px]">Ctrl+Z</kbd> anytime to step back through these snapshots visually.
        </p>
      </div>
    </div>
  );
}
