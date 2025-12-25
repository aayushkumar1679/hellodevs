"use client";

import React, { useMemo, useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Square,
  Rows,
  Columns,
  Grid3x3,
  Box,
  Minus,
  Navigation,
  Type,
  FileText,
  Image as ImageIcon,
  MousePointerClick,
  BadgeCheck,
  AlertTriangle,
  LayoutTemplate,
} from "lucide-react";
import {
  COMPONENT_LIBRARY,
  ComponentDefinition,
  ComponentCategory,
} from "@/config/componentRegistry";

interface ComponentLibraryProps {
  categories?: ComponentCategory[];
  onComponentAdd?: (def: ComponentDefinition, id: string) => void;
}

/* ----------------------------------------
  Icon map (NO emojis)
----------------------------------------- */

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  // Layout
  section: <LayoutTemplate size={16} />,
  "flex-row": <Rows size={16} />,
  "flex-column": <Columns size={16} />,
  grid: <Grid3x3 size={16} />,
  container: <Box size={16} />,
  spacer: <Minus size={16} />,
  divider: <Minus size={16} />,

  // Navigation
  navbar: <Navigation size={16} />,

  // Content
  card: <Square size={16} />,
  heading: <Type size={16} />,
  text: <FileText size={16} />,
  image: <ImageIcon size={16} />,
  button: <MousePointerClick size={16} />,
  badge: <BadgeCheck size={16} />,

  // Feedback
  alert: <AlertTriangle size={16} />,
};

/* ========================================
  Component Library
======================================== */

export default function ComponentLibrary({
  categories,
  onComponentAdd,
}: ComponentLibraryProps) {
  const { addComponent } = useCanvasStore();
  const { addElement } = useDesignStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ComponentCategory | "all"
  >("all");

  const handleAddComponent = (def: ComponentDefinition) => {
    const componentId = addComponent(def.type);
    addElement(componentId, def.type, def.defaultCss ?? {});
    onComponentAdd?.(def, componentId);
  };

  /* ----------------------------------------
    Data helpers
  ----------------------------------------- */

  const availableCategories = useMemo(
    () => Array.from(new Set(COMPONENT_LIBRARY.map((c) => c.category))).sort(),
    []
  );

  const filteredComponents = useMemo(() => {
    return COMPONENT_LIBRARY.filter((c) => {
      if (categories && !categories.includes(c.category)) return false;
      if (activeCategory !== "all" && c.category !== activeCategory)
        return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.label.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [categories, activeCategory, search]);

  const groupedComponents = useMemo(() => {
    const groups: Record<string, ComponentDefinition[]> = {};
    filteredComponents.forEach((c) => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredComponents]);

  /* ----------------------------------------
    Render
  ----------------------------------------- */

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
          Component Library
        </p>
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
      </div>

      {/* Search */}
      <div className="px-2 flex items-center gap-1.5 bg-gray-900/60 border border-gray-800 rounded-sm">
        <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="bg-transparent text-[11px] text-gray-200 placeholder-gray-500 outline-none py-1.5 flex-1"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-gray-500 hover:text-gray-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1 px-2 max-h-20 overflow-y-auto">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap transition-colors ${
            activeCategory === "all"
              ? "bg-blue-400 text-gray-900 border-blue-400"
              : "border-gray-700 text-gray-400 hover:bg-gray-800/80"
          }`}
        >
          All
        </button>
        {availableCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as ComponentCategory)}
            className={`px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-blue-400 text-gray-900 border-blue-400"
                : "border-gray-700 text-gray-400 hover:bg-gray-800/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(groupedComponents).map(([category, comps]) => (
          <div key={category}>
            <p className="px-2 pt-2 pb-1 text-[9px] uppercase tracking-wider text-gray-500">
              {category}
            </p>

            {comps.map((comp) => (
              <button
                key={comp.type}
                onClick={() => handleAddComponent(comp)}
                className="w-full flex items-center gap-2 px-2 py-2 text-left text-xs text-gray-300 hover:bg-gray-800/80 hover:text-gray-100 rounded-sm transition-all group"
              >
                <span className="w-7 h-7 flex items-center justify-center rounded bg-gray-800 text-gray-300 group-hover:bg-blue-400/20 group-hover:text-blue-300">
                  {COMPONENT_ICONS[comp.type] ?? <Square size={16} />}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-gray-200 truncate">
                      {comp.label}
                    </p>
                    {comp.isLayout && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300">
                        Layout
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {comp.description}
                  </p>
                </div>

                <Plus
                  size={14}
                  className="text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0"
                />
              </button>
            ))}
          </div>
        ))}

        {filteredComponents.length === 0 && (
          <p className="text-[11px] text-gray-500 px-2 py-3 text-center">
            No components match your search.
          </p>
        )}
      </div>
    </div>
  );
}
