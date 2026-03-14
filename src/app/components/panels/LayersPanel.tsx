"use client";

import React from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import {
  ChevronRight,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Box,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LayerMeta = { locked?: boolean; hidden?: boolean };

export default function LayersPanel() {
  const { currentProject, moveComponent, updateComponent } = useProjectStore();
  const { selectElement, selectedElements, deselectAll } = useEditorStore();

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!currentProject || Object.keys(currentProject.components).length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Layers className="mb-3 h-8 w-8 text-white/10" />
        <p className="text-[10px] font-semibold text-white/25">No layers yet</p>
        <p className="mt-1 text-[9px] text-white/15">
          Add components from the library
        </p>
      </div>
    );
  }

  const getMeta = (props: Record<string, unknown>): LayerMeta => {
    const meta = props.meta;
    return meta && typeof meta === "object" ? (meta as LayerMeta) : {};
  };

  const toggle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const getRoots = () => {
    const comps = currentProject.components;
    const childIds = new Set<string>();
    Object.values(comps).forEach((c) =>
      c.children.forEach((id: string) => childIds.add(id)),
    );
    return Object.keys(comps).filter((id) => !childIds.has(id));
  };

  const isDescendant = (parentId: string, childId: string) => {
    const stack = [parentId];
    while (stack.length) {
      const cur = stack.pop()!;
      if (cur === childId) return true;
      stack.push(...(currentProject.components[cur]?.children ?? []));
    }
    return false;
  };

  const toggleLock = (id: string) => {
    const c = currentProject.components[id];
    const props = c.props ?? {};
    const meta = getMeta(props);
    const newMeta = { ...meta, locked: !meta.locked };
    updateComponent(id, { props: { ...props, meta: newMeta } });
    if (newMeta.locked && selectedElements.includes(id)) deselectAll();
  };

  const toggleHidden = (id: string) => {
    const c = currentProject.components[id];
    const props = c.props ?? {};
    const meta = getMeta(props);
    updateComponent(id, {
      props: { ...props, meta: { ...meta, hidden: !meta.hidden } },
    });
  };

  const commitRename = (id: string) => {
    const c = currentProject.components[id];
    updateComponent(id, { props: { ...c.props, label: editValue } });
    setEditingId(null);
  };

  const renderLayer = (
    c: (typeof currentProject.components)[string],
    level = 0,
  ): React.ReactNode => {
    const isExpanded = expandedIds.has(c.id);
    const isSelected = selectedElements.includes(c.id);
    const isDrop = dropTargetId === c.id;
    const props = c.props ?? {};
    const meta = getMeta(props);
    const locked = !!meta.locked;
    const hidden = !!meta.hidden;
    const labelSrc = props.label ?? props.text;
    const label = typeof labelSrc === "string" ? labelSrc : c.type;

    return (
      <div key={c.id}>
        <motion.div
          layout
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          draggable={!locked}
          onDragStart={(e: any) => {
            if (locked) {
              e.preventDefault();
              return;
            }
            setDraggedId(c.id);
          }}
          onDragOver={(e: any) => {
            e.preventDefault();
            if (
              !draggedId ||
              draggedId === c.id ||
              isDescendant(draggedId, c.id)
            )
              return;
            setDropTargetId(c.id);
          }}
          onDrop={() => {
            if (
              draggedId &&
              draggedId !== c.id &&
              !isDescendant(draggedId, c.id)
            )
              moveComponent(draggedId, c.id);
            setDraggedId(null);
            setDropTargetId(null);
          }}
          onClick={() => !locked && selectElement(c.id)}
          className={`group flex h-7 cursor-pointer items-center gap-1.5 border-b border-white/[0.03] transition-all ${
            isSelected ? "bg-violet-600/15" : "hover:bg-white/[0.03]"
          } ${isDrop ? "ring-1 ring-inset ring-violet-500/40" : ""}`}
          style={{ paddingLeft: 8 + level * 14 }}
        >
          {/* Expand chevron */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
            {c.children.length > 0 ? (
              <button
                onClick={(e) => toggle(c.id, e)}
                className="text-white/20 hover:text-white/50 transition-colors"
              >
                <ChevronRight
                  className={`h-3 w-3 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                />
              </button>
            ) : (
              <div className="h-1 w-1 rounded-full bg-white/10" />
            )}
          </div>

          {/* Type icon */}
          <div
            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-colors ${isSelected ? "text-violet-400" : "text-white/20"}`}
          >
            <Box className="h-2.5 w-2.5" />
          </div>

          {/* Label / rename */}
          <div className="min-w-0 flex-1 overflow-hidden">
            {editingId === c.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitRename(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(c.id);
                }}
                className="w-full rounded bg-violet-500/15 px-1 text-[10px] text-white/80 outline-none"
              />
            ) : (
              <div
                className="flex items-baseline gap-1"
                onDoubleClick={() => {
                  setEditingId(c.id);
                  setEditValue(label);
                }}
              >
                <span
                  className={`truncate text-[10px] font-medium ${isSelected ? "text-white/80" : "text-white/45"} ${hidden ? "opacity-30 line-through" : ""}`}
                >
                  {label}
                </span>
                <span className="flex-shrink-0 text-[8px] text-white/15">
                  {c.type}
                </span>
              </div>
            )}
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex flex-shrink-0 items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHidden(c.id);
              }}
              className={`rounded p-0.5 transition ${hidden ? "text-white/20" : "text-white/30 hover:text-white/60"}`}
            >
              {hidden ? (
                <EyeOff className="h-2.5 w-2.5" />
              ) : (
                <Eye className="h-2.5 w-2.5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(c.id);
              }}
              className={`rounded p-0.5 transition ${locked ? "text-amber-400" : "text-white/30 hover:text-white/60"}`}
            >
              {locked ? (
                <Lock className="h-2.5 w-2.5" />
              ) : (
                <Unlock className="h-2.5 w-2.5" />
              )}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && c.children.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-l border-white/[0.04] ml-4"
            >
              {c.children.map((cid: string) => {
                const child = currentProject.components[cid];
                return child ? renderLayer(child, level + 1) : null;
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-[#111114] text-white">
      <div className="flex-shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
          Layers
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        {getRoots().map((id) => {
          const c = currentProject.components[id];
          return c ? renderLayer(c) : null;
        })}
      </div>
    </div>
  );
}
