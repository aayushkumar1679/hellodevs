"use client";

import React from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { X, Trash2, Eye, EyeOff } from "lucide-react";

export default function ElementInspector() {
  const selectedElements = useEditorStore((state) => state.selectedElements);
  const deselectAll = useEditorStore((state) => state.deselectAll);
  const activeBreakpoint = useEditorStore((state) => state.activeBreakpoint);
  const updateCSSProperty = useProjectStore((state) => state.updateComponentCSSOverride);
  const { currentProject, removeComponent } = useProjectStore();

  if (selectedElements.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-center text-sm text-slate-500">
        No elements selected yet.
      </div>
    );
  }

  const getElementInfo = (id: string) => {
    const component = currentProject?.components[id];
    const textProp = component?.props?.text;
    const label =
      typeof textProp === "string" || typeof textProp === "number"
        ? String(textProp)
        : component?.type || "Element";

    return {
      type: component?.type || "Unknown",
      label,
    };
  };

  const handleToggleVisibility = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const element = currentProject?.components[id];
    const currentDisplay = element?.cssOverrides?.base?.display || "block";
    updateCSSProperty(id, activeBreakpoint, "display", currentDisplay === "none" ? "block" : "none");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Selection
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {selectedElements.length} layer
            {selectedElements.length === 1 ? "" : "s"} selected
          </p>
        </div>

        <button
          onClick={deselectAll}
          className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {selectedElements.map((id) => {
          const info = getElementInfo(id);
          const element = currentProject?.components[id];
          const isHidden = element?.cssOverrides?.base?.display === "none";

          return (
            <div
              key={id}
              className="group rounded-[22px] border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {info.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{info.type}</p>
                </div>

                <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    onClick={(event) => handleToggleVisibility(id, event)}
                    className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
                    title={isHidden ? "Show layer" : "Hide layer"}
                  >
                    {isHidden ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => removeComponent(id)}
                    className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedElements.length > 1 && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
          Bulk style edits apply to every selected element.
        </div>
      )}
    </div>
  );
}
