"use client";

import React, { useState } from "react";
import { useProjectStore, type PolyglotComponent } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  GripVertical,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LayersPanel() {
  const { currentProject } = useProjectStore();
  const { selectedElements, selectElement } = useEditorStore();

  if (!currentProject) return null;

  const rootIds = currentProject.rootOrder;

  return (
    <div className="flex h-full flex-col bg-[#05060b] text-white">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-violet-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">Layers</h2>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40">
          {Object.keys(currentProject.components).length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
        <div className="space-y-1">
          {rootIds.map((id) => (
            <LayerItem
              key={id}
              itemId={id}
              depth={0}
              components={currentProject.components}
              selectedIds={selectedElements}
              onSelect={selectElement}
              onDelete={(targetId) => useProjectStore.getState().removeComponent(targetId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LayerItemProps {
  itemId: string;
  depth: number;
  components: Record<string, PolyglotComponent>;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  itemId,
  depth,
  components,
  selectedIds,
  onSelect,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [locked, setLocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  const draggedId = useEditorStore((s) => s.draggedId);
  const setDraggedId = useEditorStore((s) => s.setDraggedId);

  const c = components[itemId];
  if (!c) return null;

  const isSelected = selectedIds.includes(itemId);
  const hasChildren = c.children && c.children.length > 0;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId && draggedId !== itemId) {
      useProjectStore.getState().moveComponent(draggedId, itemId);
      setDraggedId(null);
    }
  };

  return (
    <div>
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`group relative flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all ${
          isSelected
            ? "bg-violet-600/20 text-violet-100 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]"
            : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(itemId, e.shiftKey || e.metaKey);
        }}
        draggable
        onDragStart={(e) => {
          if (locked) {
            e.preventDefault();
            return;
          }
          setDraggedId(itemId);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={handleDrop}
      >
        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-white/20 hover:text-white/60"
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="h-1 w-1 rounded-full bg-white/10" />
          )}
        </div>

        <GripVertical className="h-3 w-3 shrink-0 text-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        
        <span className="flex-1 truncate text-[11px] font-medium">
          {c.props?.text ? String(c.props.text).slice(0, 20) : c.type}
        </span>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(itemId);
            }}
            className="p-1 text-rose-400/40 hover:text-rose-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLocked(!locked);
            }}
            className={`p-1 hover:text-white ${locked ? "text-violet-400" : "text-white/20"}`}
          >
            {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHidden(!hidden);
            }}
            className={`p-1 hover:text-white ${hidden ? "text-violet-400" : "text-white/20"}`}
          >
            {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {c.children.map((childId) => (
              <LayerItem
                key={childId}
                itemId={childId}
                depth={depth + 1}
                components={components}
                selectedIds={selectedIds}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
