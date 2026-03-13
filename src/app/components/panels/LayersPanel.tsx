"use client";

import React from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Box,
} from "lucide-react";

type DropPosition = "before" | "after" | null;
type DropMode = "nest" | "reorder" | null;
type LayerMeta = {
  locked?: boolean;
  hidden?: boolean;
};

export default function LayersPanel() {
  const {
    currentProject,
    moveComponent,
    updateComponent,
  } = useCanvasStore();

  const { selectElement, selectedElements, deselectAll } = useDesignStore();

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = React.useState<string | null>(null);
  const [dropMode, setDropMode] = React.useState<DropMode>(null);
  const [dropPosition, setDropPosition] = React.useState<DropPosition>(null);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");

  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const menuNodeRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenuId(null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const node = menuNodeRef.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!currentProject || Object.keys(currentProject.components).length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
        <Layers className="mb-4 h-12 w-12 opacity-20" />
        <p className="text-xs font-medium">No layers yet</p>
      </div>
    );
  }

  /* ---------------- Helpers ---------------- */

  const getMeta = (props: Record<string, unknown>): LayerMeta => {
    const meta = props.meta;
    return meta && typeof meta === "object" ? (meta as LayerMeta) : {};
  };

  const toggleExpanded = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getParentId = (childId: string): string | null => {
    const parentEntry = Object.entries(currentProject.components).find(
      ([, c]) => (c.children || []).includes(childId)
    );
    return parentEntry ? parentEntry[0] : null;
  };

  const getRootOrder = (): string[] => {
    const comps = currentProject.components;
    const allIds = Object.keys(comps);
    const childrenIds = new Set<string>();
    allIds.forEach((id) =>
      (comps[id].children || []).forEach((c: string) => childrenIds.add(c))
    );
    return allIds.filter((id) => !childrenIds.has(id));
  };

  const isDescendant = (parentId: string, possibleChildId: string) => {
    const stack = [parentId];
    while (stack.length) {
      const cur = stack.pop()!;
      if (cur === possibleChildId) return true;
      stack.push(...(currentProject.components[cur]?.children ?? []));
    }
    return false;
  };

  const toggleLock = (id: string) => {
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    const meta = getMeta(props);
    const newMeta = { ...meta, locked: !meta.locked };
    updateComponent(id, { props: { ...props, meta: newMeta } });
    if (newMeta.locked && selectedElements.includes(id)) {
      deselectAll();
    }
  };

  const toggleHidden = (id: string) => {
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    const meta = getMeta(props);
    const newMeta = { ...meta, hidden: !meta.hidden };
    updateComponent(id, { props: { ...props, meta: newMeta } });
  };

  const startEditing = (id: string) => {
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    const currentLabel =
      (typeof props.label === "string" && props.label) ||
      (typeof props.text === "string" && props.text) ||
      comp.type;
    setEditingId(id);
    setEditValue(currentLabel);
    setOpenMenuId(null);
  };

  const commitRename = (id: string) => {
    if (!id) return;
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    updateComponent(id, { props: { ...props, label: editValue } });
    setEditingId(null);
  };

  /* ---------------- Drag logic ---------------- */

  const onDragStart = (id: string, e: React.DragEvent) => {
    const comp = currentProject.components[id];
    if (getMeta(comp.props ?? {}).locked) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
  };

  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || isDescendant(draggedId, targetId)) return;
    setDropTargetId(targetId);
    setDropMode("nest");
  };

  const onDrop = (targetId: string) => {
    if (draggedId && draggedId !== targetId && !isDescendant(draggedId, targetId)) {
      moveComponent(draggedId, targetId);
    }
    setDraggedId(null);
    setDropTargetId(null);
    setDropMode(null);
  };

  /* ---------------- Render Component ---------------- */

  const renderComponent = (
    c: (typeof currentProject.components)[string],
    level = 0
  ) => {
    const isExpanded = expandedIds.has(c.id);
    const isSelected = selectedElements.includes(c.id);
    const isDrop = dropTargetId === c.id;
    const pad = 12 + level * 16;

    const props = c.props ?? {};
    const meta = getMeta(props);
    const locked = !!meta.locked;
    const hidden = !!meta.hidden;
    const labelSource = props.label ?? props.text;
    const label =
      typeof labelSource === "string" || typeof labelSource === "number"
        ? String(labelSource)
        : c.type;

    return (
      <div key={c.id}>
        <div
          draggable={!locked}
          onDragStart={(e) => onDragStart(c.id, e)}
          onDragOver={(e) => onDragOver(e, c.id)}
          onDrop={() => onDrop(c.id)}
          onClick={() => !locked && selectElement(c.id)}
          className={`group flex items-center gap-2 px-1 py-1.5 transition-all cursor-pointer border-b border-slate-50/50 
            ${isSelected ? "bg-sky-50/80" : "hover:bg-slate-50/50"}
            ${isDrop ? "ring-2 ring-sky-400 ring-inset" : ""}
          `}
          style={{ paddingLeft: pad }}
        >
          {/* Collapse/Expand Toggle */}
          <div className="w-5 flex items-center justify-center">
            {c.children.length > 0 ? (
              <button 
                onClick={(e) => toggleExpanded(c.id, e)}
                className={`p-1 rounded-md transition-colors hover:bg-slate-200/50 ${isSelected ? "text-sky-600" : "text-slate-400"}`}
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200/50" />
            )}
          </div>

          <div className={`p-1.5 rounded-lg border ${isSelected ? "bg-white border-sky-200 text-sky-600" : "bg-slate-100/50 border-slate-200 text-slate-500"}`}>
             <Box size={14} />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            {editingId === c.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitRename(c.id)}
                onKeyDown={(e) => e.key === "Enter" && commitRename(c.id)}
                className="w-full bg-white px-1.5 py-0.5 rounded border border-sky-300 outline-none text-xs text-sky-700"
              />
            ) : (
              <div className="flex flex-col">
                <span className={`truncate text-xs font-bold leading-tight ${isSelected ? "text-sky-900" : "text-slate-700"} ${hidden ? "opacity-40 italic" : ""}`}>
                  {label}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{c.type}</span>
              </div>
            )}
          </div>

          {/* Visibility & Locking Indicators */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleHidden(c.id); }}
              className={`p-1.5 rounded-md hover:bg-slate-200/50 ${hidden ? "text-slate-300" : "text-slate-500"}`}
            >
              {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLock(c.id); }}
              className={`p-1.5 rounded-md hover:bg-slate-200/50 ${locked ? "text-amber-500" : "text-slate-500"}`}
            >
              {locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
          </div>
        </div>

        {isExpanded && c.children.length > 0 && (
          <div className="border-l border-slate-100 ml-4">
            {c.children.map((cid: string) => {
              const child = currentProject.components[cid];
              return child ? renderComponent(child, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Component Tree
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {getRootOrder().map((id) => {
          const c = currentProject.components[id];
          return c ? renderComponent(c) : null;
        })}
      </div>
    </div>
  );
}
