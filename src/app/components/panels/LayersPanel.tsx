"use client";

import React from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import {
  ChevronRight,
  ChevronDown,
  Trash2,
  GripVertical,
  Square,
} from "lucide-react";

export default function LayersPanel() {
  const { currentProject, removeComponent, reorderChildren } = useCanvasStore();

  const { selectElement, selectedElements } = useDesignStore();

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  if (!currentProject || Object.keys(currentProject.components).length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-xs">
        No components added yet
      </div>
    );
  }

  /* ----------------------------------------
     Helpers
  ----------------------------------------- */

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getParentId = (childId: string): string | null => {
    const parent = Object.values(currentProject.components).find((c) =>
      c.children.includes(childId)
    );
    return parent ? parent.id : null;
  };

  const getSiblings = (id: string): string[] => {
    const parentId = getParentId(id);
    if (parentId) {
      return currentProject.components[parentId]?.children ?? [];
    }
    // ✅ ROOT-LEVEL ORDER (FIX)
    return currentProject.rootOrder;
  };

  /* ----------------------------------------
     Drag logic
  ----------------------------------------- */

  const onDragStart = (id: string, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(id);
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;

    if (getParentId(draggedId) !== getParentId(id)) return;
    setOverId(id);
  };

  const onDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const parentId = getParentId(draggedId);
    if (parentId !== getParentId(targetId)) return;

    const siblings = getSiblings(draggedId);
    const from = siblings.indexOf(draggedId);
    const to = siblings.indexOf(targetId);

    if (from < 0 || to < 0) return;

    const reordered = [...siblings];
    reordered.splice(from, 1);
    reordered.splice(to, 0, draggedId);

    reorderChildren(parentId, reordered);

    setDraggedId(null);
    setOverId(null);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setOverId(null);
  };

  /* ----------------------------------------
     Render tree
  ----------------------------------------- */

  const renderComponent = (component: any, level = 0) => {
    const isExpanded = expandedIds.has(component.id);
    const isSelected = selectedElements.includes(component.id);
    const hasChildren = component.children.length > 0;
    const isOver = overId === component.id;

    return (
      <div key={component.id}>
        <div
          draggable
          onDragStart={(e) => onDragStart(component.id, e)}
          onDragOver={(e) => onDragOver(e, component.id)}
          onDrop={() => onDrop(component.id)}
          onDragEnd={onDragEnd}
          className={`group flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-md transition-colors ${
            isSelected
              ? "bg-blue-400/20 text-blue-300"
              : "text-gray-300 hover:bg-gray-800/70"
          } ${isOver ? "ring-1 ring-blue-400/50" : ""}`}
          style={{ paddingLeft: 8 + level * 14 }}
        >
          <GripVertical size={12} className="text-gray-500 cursor-grab" />

          {hasChildren ? (
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
            <span className="w-4" />
          )}

          <Square size={14} className="text-gray-500" />

          <button
            onClick={() => selectElement(component.id)}
            className="flex-1 truncate text-left font-medium"
          >
            {component.type}
          </button>

          <button
            onClick={() => removeComponent(component.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-600/80 text-red-400 hover:text-white"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {component.children.map((childId: string) => {
              const child = currentProject.components[childId];
              return child ? renderComponent(child, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  /* ----------------------------------------
     ROOT render (ORDERED)
  ----------------------------------------- */

  return (
    <div className="p-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
        Layers
      </p>

      {(currentProject.rootOrder ?? []).map((id) => {
        const component = currentProject.components[id];
        return component ? renderComponent(component) : null;
      })}
    </div>
  );
}
