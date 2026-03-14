"use client";

import React from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";

export default function PropertyPanel() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const updateComponent = useProjectStore((state) => state.updateComponent);
  const selectedElements = useEditorStore((state) => state.selectedElements);

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

      {Object.entries(selectedComponent.props || {}).map(([key, val]) => {
        // Skip hidden/internal props
        if (key.startsWith("_")) return null;

        const stringVal = String(val || "");

        // Determine input type
        if (key === "text" || key === "description" || stringVal.length > 50) {
          return (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {key}
              </label>
              <textarea
                value={stringVal}
                onChange={(event) => updateProp(key, event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 custom-scrollbar"
              />
            </div>
          );
        }

        if (key === "href" || key === "src") {
           return (
             <div key={key}>
               <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                 {key}
               </label>
               <input
                 type="url"
                 value={stringVal}
                 onChange={(event) => updateProp(key, event.target.value)}
                 placeholder={`https://...`}
                 className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
               />
             </div>
           );
        }

        if (key === "variant") {
            return (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {key}
                </label>
                <select
                  value={stringVal}
                  onChange={(event) => updateProp(key, event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 appearance-none"
                >
                  <option value="default">Default</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                  <option value="destructive">Destructive</option>
                  <option value="link">Link</option>
                </select>
              </div>
            );
        }

        return (
          <div key={key}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {key}
            </label>
            <input
              type="text"
              value={stringVal}
              onChange={(event) => updateProp(key, event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            />
          </div>
        );
      })}
    </div>
  );
}
