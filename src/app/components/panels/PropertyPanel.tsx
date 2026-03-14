"use client";

import React from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";

export default function PropertyPanel() {
  const currentProject = useCanvasStore((state) => state.currentProject);
  const updateComponent = useCanvasStore((state) => state.updateComponent);
  const selectedElements = useDesignStore((state) => state.selectedElements);

  const selectedComponentId = selectedElements[0];
  const selectedComponent =
    selectedComponentId && currentProject
      ? currentProject.components[selectedComponentId]
      : null;

  if (!selectedComponent) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Select a component to edit its content properties.
      </div>
    );
  }

  const updateProp = (key: string, value: string) => {
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          {selectedComponent.type}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{selectedComponent.id}</p>
      </div>

      {"text" in (selectedComponent.props || {}) && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Text
          </label>
          <textarea
            value={String(selectedComponent.props?.text || "")}
            onChange={(event) => updateProp("text", event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
        </div>
      )}

      {"title" in (selectedComponent.props || {}) && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Title
          </label>
          <input
            value={String(selectedComponent.props?.title || "")}
            onChange={(event) => updateProp("title", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
        </div>
      )}
    </div>
  );
}
