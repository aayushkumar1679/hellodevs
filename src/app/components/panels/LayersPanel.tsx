"use client";

import React from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { ChevronRight, ChevronDown, Eye, Trash2 } from "lucide-react";

export default function LayersPanel() {
  const { currentProject, removeComponent } = useCanvasStore();
  const { selectElement, selectedElements } = useDesignStore();
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  if (!currentProject || Object.keys(currentProject.components).length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-xs">
        <p>No components added yet</p>
      </div>
    );
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderComponent = (component: any, level: number = 0) => {
    const isExpanded = expandedIds.has(component.id);
    const isSelected = selectedElements.includes(component.id);

    return (
      <div key={component.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-700 group ${
            isSelected ? "bg-blue-600 text-white" : "text-gray-300"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {component.children.length > 0 ? (
            <button
              onClick={() => toggleExpanded(component.id)}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <span
            onClick={() => selectElement(component.id)}
            className="flex-1 font-medium"
          >
            {component.type}
          </span>
          <button
            onClick={() => removeComponent(component.id)}
            className="p-0.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded"
          >
            <Trash2 size={12} />
          </button>
        </div>
        {isExpanded &&
          component.children.map((childId: string) => {
            const child = currentProject.components[childId];
            return child ? renderComponent(child, level + 1) : null;
          })}
      </div>
    );
  };

  return (
    <div className="p-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
        Layers
      </p>
      <div className="space-y-0">
        {Object.values(currentProject.components)
          .filter(
            (c) =>
              !Object.values(currentProject.components).some((parent) =>
                parent.children.includes(c.id)
              )
          )
          .map((component) => renderComponent(component))}
      </div>
    </div>
  );
}
