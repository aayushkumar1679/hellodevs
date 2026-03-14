"use client";

import React from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { X, Trash2, Eye, EyeOff } from "lucide-react";

export default function ElementInspector() {
  const selectedElements = useEditorStore((s) => s.selectedElements);
  const deselectAll = useEditorStore((s) => s.deselectAll);
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint);
  const { currentProject, removeComponent, updateComponentCSSOverride } =
    useProjectStore();

  if (selectedElements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.07] px-3 py-4 text-center">
        <p className="text-[10px] text-white/20">No element selected</p>
      </div>
    );
  }

  const getInfo = (id: string) => {
    const comp = currentProject?.components[id];
    const textProp = comp?.props?.text;
    return {
      type: comp?.type ?? "Unknown",
      label:
        typeof textProp === "string" ? textProp : (comp?.type ?? "Element"),
    };
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const comp = currentProject?.components[id];
    const cur = comp?.cssOverrides?.base?.display || "block";
    updateComponentCSSOverride(
      id,
      activeBreakpoint,
      "display",
      cur === "none" ? "block" : "none",
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
          {selectedElements.length} selected
        </p>
        <button
          onClick={deselectAll}
          className="flex h-5 w-5 items-center justify-center rounded-md text-white/20 transition hover:bg-white/[0.06] hover:text-white/50"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-1.5">
        {selectedElements.map((id) => {
          const info = getInfo(id);
          const comp = currentProject?.components[id];
          const isHidden = comp?.cssOverrides?.base?.display === "none";

          return (
            <div
              key={id}
              className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 transition hover:border-white/10"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-white/60">
                  {info.label}
                </p>
                <p className="text-[9px] text-white/25">{info.type}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => toggleVisibility(id, e)}
                  className={`flex h-6 w-6 items-center justify-center rounded-md transition ${isHidden ? "text-white/20" : "text-white/30 hover:bg-white/[0.06] hover:text-white/60"}`}
                >
                  {isHidden ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={() => removeComponent(id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedElements.length > 1 && (
        <p className="rounded-lg border border-sky-500/15 bg-sky-500/6 px-2.5 py-1.5 text-[9px] text-sky-400">
          Bulk style edits apply to all selected elements.
        </p>
      )}
    </div>
  );
}
