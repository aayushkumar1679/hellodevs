"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";

export default function ElementTree() {
  const { currentProject, removeComponent: removeElement } = useProjectStore();
  const elements = currentProject?.components || {};
  const { selectedElements, selectElement } = useEditorStore();
  const [expandedElements, setExpandedElements] = useState<Set<string>>(
    new Set()
  );

  const toggleElement = (id: string) => {
    const newExpanded = new Set(expandedElements);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedElements(newExpanded);
  };

  const renderElement = (id: string, depth: number = 0) => {
    const element = elements[id];
    if (!element) return null;

    const hasChildren = element.children && element.children.length > 0;
    const isSelected = selectedElements.includes(id);
    const isExpanded = expandedElements.has(id);

    return (
      <div key={id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded ml-${
            depth * 4
          } ${
            isSelected
              ? "bg-blue-100 border border-blue-300"
              : "hover:bg-gray-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            selectElement(id, e.ctrlKey || e.metaKey);
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleElement(id);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}

          <span className="text-sm font-medium text-gray-700">
            {element.type}
          </span>
          <span className="text-xs text-gray-500">#{id}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeElement(id);
            }}
            className="ml-auto text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {element.children?.map((childId) =>
              renderElement(childId, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const rootElements = (currentProject?.rootOrder || []).map(id => elements[id]).filter(Boolean);

  return (
    <div className="p-4 space-y-2 h-full overflow-y-auto">
      <h3 className="font-bold text-sm text-gray-700 mb-4">DOM Structure</h3>
      {rootElements.length === 0 ? (
        <p className="text-xs text-gray-400">No elements on canvas</p>
      ) : (
        rootElements.map((el) => renderElement(el.id))
      )}
    </div>
  );
}
