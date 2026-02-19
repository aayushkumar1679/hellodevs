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
  LogOut,
  Lock,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pen,
} from "lucide-react";

type DropPosition = "before" | "after" | null;
type DropMode = "nest" | "reorder" | null;

/**
 * LayersPanel — improved IDE-level UI + bug fixes
 *
 * Key fixes:
 * - safe fallback for root list (rootOrder | rootIds | computed)
 * - use deselectAll to clear selection instead of pass-empty-string
 * - click-outside menu detection tied to actual menu node (reliable)
 * - minor drag/reorder robustness and clearer insert indicators
 */

export default function LayersPanel() {
  const {
    currentProject,
    removeComponent,
    reorderChildren,
    moveComponent,
    updateComponent,
  } = useCanvasStore();

  // design store. NOTE: many stores expose deselectAll in your repo; use if available
  const { selectElement, selectedElements, deselectAll } = useDesignStore();

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = React.useState<string | null>(null);
  const [dropMode, setDropMode] = React.useState<DropMode>(null);
  const [dropPosition, setDropPosition] = React.useState<DropPosition>(null);

  // Inline rename state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");

  // which row's menu is open
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  // ref to currently open menu DOM node (for accurate click-outside)
  const menuNodeRef = React.useRef<HTMLElement | null>(null);

  // Close menu on Escape
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

  // Click-outside handler for the open menu (reliable)
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
      <div className="p-4 text-center text-gray-400 text-xs">
        No components added yet
      </div>
    );
  }

  /* ---------------- Helpers ---------------- */

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const getParentId = (childId: string): string | null => {
    const parentEntry = Object.entries(currentProject.components).find(
      ([, c]) => (c.children || []).includes(childId)
    );
    return parentEntry ? parentEntry[0] : null;
  };

  // root list safe fallback: prefer rootOrder -> rootIds -> compute
  const getRootOrder = (): string[] => {
    if (
      Array.isArray((currentProject as any).rootOrder) &&
      (currentProject as any).rootOrder.length
    )
      return (currentProject as any).rootOrder;
    if (
      Array.isArray((currentProject as any).rootIds) &&
      (currentProject as any).rootIds.length
    )
      return (currentProject as any).rootIds;
    // compute roots from components (no parent)
    const comps = currentProject.components;
    const allIds = Object.keys(comps);
    const childrenIds = new Set<string>();
    allIds.forEach((id) =>
      (comps[id].children || []).forEach((c: string) => childrenIds.add(c))
    );
    return allIds.filter((id) => !childrenIds.has(id));
  };

  const getSiblings = (id: string): string[] => {
    const parentId = getParentId(id);
    if (parentId) return currentProject.components[parentId]?.children ?? [];
    return getRootOrder();
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

  const getGrandParentId = (childId: string): string | null => {
    const parent = getParentId(childId);
    if (!parent) return null;
    return getParentId(parent);
  };

  const indexInParent = (id: string, parentId: string | null) => {
    if (parentId) {
      return currentProject.components[parentId]?.children.indexOf(id) ?? -1;
    }
    return getRootOrder().indexOf(id);
  };

  /* ---------------- Ungroup (icon action) ---------------- */

  const ungroup = (childId: string) => {
    const parentId = getParentId(childId);
    if (!parentId) return;
    const grandParentId = getGrandParentId(childId); // may be null => root
    const parentIndex = indexInParent(parentId, grandParentId);
    const insertIndex = parentIndex >= 0 ? parentIndex + 1 : undefined;
    moveComponent(childId, grandParentId, insertIndex);
  };

  /* ---------------- Lock / Hide ---------------- */

  const toggleLock = (id: string) => {
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    const meta = (props.meta as any) ?? {};
    const newMeta = { ...meta, locked: !meta.locked };
    updateComponent(id, { props: { ...props, meta: newMeta } });

    // if we locked a selected element, clear selection safely
    if (newMeta.locked && selectedElements.includes(id)) {
      // prefer explicit deselectAll if available
      if (typeof deselectAll === "function") deselectAll();
      else selectElement("", false as any);
    }
  };

  const toggleHidden = (id: string) => {
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    const meta = (props.meta as any) ?? {};
    const newMeta = { ...meta, hidden: !meta.hidden };
    updateComponent(id, { props: { ...props, meta: newMeta } });
  };

  /* ---------------- Inline rename ---------------- */

  const startEditing = (id: string) => {
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    const currentLabel = (props.label as string) ?? props.text ?? comp.type;
    setEditingId(id);
    setEditValue(currentLabel);
    setExpandedIds((s) => new Set(s).add(id));
    // ensure menu closed while editing
    setOpenMenuId(null);
  };

  const commitRename = (id: string) => {
    if (!id) return;
    const comp = currentProject.components[id];
    const props = comp.props ?? {};
    updateComponent(id, { props: { ...props, label: editValue } });
    setEditingId(null);
    setEditValue("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditValue("");
  };

  /* ---------------- Drag logic (nest + reorder) ---------------- */

  const onDragStart = (id: string, e: React.DragEvent) => {
    const comp = currentProject.components[id];
    const locked = !!(comp.props?.meta && comp.props.meta.locked);
    if (locked) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {
      /* ignore */
    }
    setDraggedId(id);
    setDropMode(null);
    setDropTargetId(null);
    setDropPosition(null);
    setOpenMenuId(null);
  };

  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDropMode(null);
      setDropTargetId(null);
      setDropPosition(null);
      return;
    }

    // can't drop onto descendant of dragged (prevents cycles)
    if (isDescendant(draggedId, targetId)) {
      setDropMode(null);
      setDropTargetId(null);
      setDropPosition(null);
      return;
    }

    const forceNest = e.altKey;
    const forceReorder = e.shiftKey;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const pos: DropPosition = e.clientY < mid ? "before" : "after";

    const draggedParent = getParentId(draggedId);
    const targetParent = getParentId(targetId);

    // SHIFT => reorder only within same parent
    if (forceReorder) {
      if (draggedParent === targetParent) {
        setDropMode("reorder");
        setDropTargetId(targetId);
        setDropPosition(pos);
      } else {
        setDropMode(null);
        setDropTargetId(null);
        setDropPosition(null);
      }
      return;
    }

    // ALT => force nest
    if (forceNest) {
      setDropMode("nest");
      setDropTargetId(targetId);
      setDropPosition(null);
      return;
    }

    // default behavior: allow nest
    setDropMode("nest");
    setDropTargetId(targetId);
    setDropPosition(null);
  };

  const onDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      setDropMode(null);
      setDropPosition(null);
      return;
    }

    // protect against accidental self-parenting
    if (isDescendant(draggedId, targetId)) {
      setDraggedId(null);
      setDropTargetId(null);
      setDropMode(null);
      setDropPosition(null);
      return;
    }

    if (dropMode === "nest") {
      moveComponent(draggedId, targetId);
    } else if (dropMode === "reorder") {
      const siblings = getSiblings(draggedId);
      const from = siblings.indexOf(draggedId);
      let to = siblings.indexOf(targetId);
      if (from >= 0 && to >= 0) {
        if (dropPosition === "after") to += 1;
        const reordered = [...siblings];
        reordered.splice(from, 1);
        reordered.splice(Math.min(to, reordered.length), 0, draggedId);
        reorderChildren(getParentId(draggedId), reordered);
      }
    }

    setDraggedId(null);
    setDropTargetId(null);
    setDropMode(null);
    setDropPosition(null);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
    setDropMode(null);
    setDropPosition(null);
  };

  /* ---------------- Render helpers ---------------- */

  const renderInsertLine = (pad: number) => (
    <div
      className="h-0.5 bg-blue-400 rounded"
      style={{ marginLeft: pad, marginRight: 8 }}
    />
  );

  const renderComponent = (c: any, level = 0) => {
    const isExpanded = expandedIds.has(c.id);
    const isSelected = selectedElements.includes(c.id);
    const isDrop = dropTargetId === c.id;
    const pad = 8 + level * 14;
    const parentId = getParentId(c.id);
    const hasParent = !!parentId;

    const props = c.props ?? {};
    const meta = (props.meta as any) ?? {};
    const locked = !!meta.locked;
    const hidden = !!meta.hidden;
    const label = props.label ?? props.text ?? c.type;

    // containerRef for the currently open menu: attach to the menu node itself
    const menuRefSetter = (node: HTMLElement | null) => {
      if (openMenuId === c.id) menuNodeRef.current = node;
      else if (menuNodeRef.current === node) menuNodeRef.current = null;
    };

    return (
      <div key={c.id}>
        {isDrop &&
          dropMode === "reorder" &&
          dropPosition === "before" &&
          renderInsertLine(pad)}

        <div
          draggable={!locked}
          onDragStart={(e) => onDragStart(c.id, e)}
          onDragOver={(e) => onDragOver(e, c.id)}
          onDrop={() => onDrop(c.id)}
          onDragEnd={onDragEnd}
          className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-xs
            ${
              isSelected
                ? "bg-blue-500/12 text-blue-300"
                : "text-gray-300 hover:bg-gray-800/60"
            }
            ${isDrop && dropMode === "nest" ? "ring-2 ring-blue-300/50" : ""}
            ${locked ? "opacity-70" : ""} ${hidden ? "opacity-40 italic" : ""}
          `}
          style={{ paddingLeft: pad }}
          aria-selected={isSelected}
        >
          <GripVertical
            size={14}
            className={`text-gray-500 ${
              locked ? "cursor-not-allowed" : "cursor-grab"
            }`}
          />

          {c.children.length > 0 ? (
            <button onClick={() => toggleExpanded(c.id)} className="p-0.5">
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <Square size={14} className="text-gray-400" />

          <div className="flex-1 min-w-0">
            {editingId === c.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitRename(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(c.id);
                  else if (e.key === "Escape") cancelRename();
                }}
                className="w-full bg-transparent outline-none text-sm text-gray-100"
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <div
                className="flex items-center gap-2"
                onClick={() => {
                  if (!locked) selectElement(c.id);
                }}
                onDoubleClick={() => {
                  if (!locked) startEditing(c.id);
                }}
                title={typeof label === "string" ? label : c.type}
              >
                <span className="truncate font-medium cursor-pointer select-none">
                  {label}
                </span>
                <span className="text-[10px] text-gray-500 ml-1">{c.type}</span>
              </div>
            )}
          </div>

          {/* actions: menu trigger */}
          <div
            className="relative ml-2 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId((cur) => (cur === c.id ? null : c.id));
              }}
              title="More"
              className="p-1 rounded hover:bg-gray-700/30 opacity-70 hover:opacity-100 transition"
            >
              <MoreHorizontal size={16} />
            </button>

            {/* Dropdown menu rendered inline and referenced by menuRefSetter for click-outside */}
            {openMenuId === c.id && (
              <div
                ref={menuRefSetter as any}
                role="menu"
                aria-label="Layer actions"
                className="absolute right-0 top-full mt-2 w-44 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <ActionRow
                    onClick={() => {
                      removeComponent(c.id);
                      setOpenMenuId(null);
                    }}
                    icon={<Trash2 size={16} />}
                    label="Delete"
                    accent="text-red-400"
                  />

                  {hasParent && (
                    <ActionRow
                      onClick={() => {
                        ungroup(c.id);
                        setOpenMenuId(null);
                      }}
                      icon={<LogOut size={16} />}
                      label="Ungroup"
                      accent="text-yellow-400"
                    />
                  )}

                  <ActionRow
                    onClick={() => {
                      toggleHidden(c.id);
                      // keep menu open intentionally so user can try again
                    }}
                    icon={hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                    label={hidden ? "Show" : "Hide"}
                  />

                  <ActionRow
                    onClick={() => {
                      toggleLock(c.id);
                    }}
                    icon={<Lock size={16} />}
                    label={meta.locked ? "Unlock" : "Lock"}
                  />

                  <div className="border-t border-gray-800 mt-1" />

                  <ActionRow
                    onClick={() => {
                      startEditing(c.id);
                      setOpenMenuId(null);
                    }}
                    icon={<Pen size={16} />}
                    label="Rename"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isDrop &&
          dropMode === "reorder" &&
          dropPosition === "after" &&
          renderInsertLine(pad)}

        {c.children.length > 0 && isExpanded && (
          <div>
            {c.children.map((cid: string) => {
              const child = currentProject.components[cid];
              return child ? renderComponent(child, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  /* ---------------- root render ---------------- */

  return (
    <div className="p-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
        Layers
      </p>

      {getRootOrder().map((id) => {
        const c = currentProject.components[id];
        return c ? renderComponent(c) : null;
      })}
    </div>
  );
}

/* ---------------- small presentational ActionRow component ---------------- */

function ActionRow({
  onClick,
  icon,
  label,
  accent,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800/30 transition-colors"
    >
      <span
        className={`w-5 h-5 flex items-center justify-center ${
          accent ?? "text-gray-200"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
