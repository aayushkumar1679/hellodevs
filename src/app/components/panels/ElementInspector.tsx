"use client";

import React from "react";
import { useDesignStore } from "@/state/useDesignStore";
import { useCanvasStore } from "@/state/useCanvasStore";
import { X, Copy, Trash2, Eye, EyeOff } from "lucide-react";

export default function ElementInspector() {
  const selectedElements = useDesignStore((state) => state.selectedElements);
  const elements = useDesignStore((state) => state.elements);
  const selectElement = useDesignStore((state) => state.selectElement);
  const removeElement = useDesignStore((state) => state.removeElement);
  const deselectAll = useDesignStore((state) => state.deselectAll);
  const updateCSSProperty = useDesignStore((state) => state.updateCSSProperty);
  const { currentProject } = useCanvasStore();

  if (selectedElements.length === 0) {
    return (
      <div className="p-3 text-gray-500 text-xs bg-linear-to-b from-gray-900 to-gray-850 border-b border-gray-800">
        <p className="text-center">No elements selected</p>
      </div>
    );
  }

  const getElementInfo = (id: string) => {
    const comp = currentProject?.components[id];
    const elem = elements[id];
    // ✅ FIXED: Use 'type' instead of non-existent 'label'
    return {
      type: comp?.type || "Unknown",
      label: comp?.props?.text || comp?.type || "Element", // Removed comp?.label
    };
  };

  const handleRemoveElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(id);
    if (selectedElements.length === 1) {
      deselectAll();
    }
  };

  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const elem = elements[id];
    const currentDisplay = elem.cssProperties?.display || "block";
    updateCSSProperty(
      id,
      "display",
      currentDisplay === "none" ? "block" : "none"
    );
  };

  return (
    <div className="p-3 space-y-2 bg-linear-to-b from-gray-900 to-gray-850 border-b border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
          {selectedElements.length} Selected
        </p>
        <button
          onClick={deselectAll}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-32 overflow-y-auto space-y-1.5">
        {selectedElements.map((id) => {
          const info = getElementInfo(id);
          const elem = elements[id];
          const isHidden = elem.cssProperties?.display === "none";

          return (
            <div
              key={id}
              className="p-2 rounded bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors group"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-200 truncate">
                    {info.label}
                  </p>
                  <p className="text-[9px] text-gray-400">{info.type}</p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleToggleVisibility(id, e)}
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
                    title={isHidden ? "Show" : "Hide"}
                  >
                    {isHidden ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleRemoveElement(id, e)}
                    className="p-1 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedElements.length > 1 && (
        <div className="pt-2 border-t border-gray-700">
          <p className="text-[9px] text-blue-300 px-2 py-1 bg-blue-500/10 rounded">
            💡 Editing properties affects all {selectedElements.length} elements
          </p>
        </div>
      )}
    </div>
  );
}
