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
   Icon map
----------------------------------------- */

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  section: <LayoutTemplate size={16} />,
  "flex-row": <Rows size={16} />,
  "flex-column": <Columns size={16} />,
  grid: <Grid3x3 size={16} />,
  container: <Box size={16} />,
  spacer: <Minus size={16} />,
  divider: <Minus size={16} />,
  navbar: <Navigation size={16} />,
  card: <Square size={16} />,
  heading: <Type size={16} />,
  text: <FileText size={16} />,
  image: <ImageIcon size={16} />,
  button: <MousePointerClick size={16} />,
  badge: <BadgeCheck size={16} />,
  alert: <AlertTriangle size={16} />,
};

const FALLBACK_ICON = <Square size={16} />;

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
      (groups[c.category] ??= []).push(c);
    });
    return groups;
  }, [filteredComponents]);

  // Display groups logic:
  // - If "all" selected -> show single "All Components" group with all filtered components
  // - If a specific category selected -> show only that category (if present)
  // - Otherwise show groupedComponents
  const displayGroups = useMemo(() => {
    if (activeCategory === "all") {
      return { "All Components": filteredComponents };
    }
    // specific category selected
    if (groupedComponents[activeCategory]) {
      return { [activeCategory]: groupedComponents[activeCategory] };
    }
    // fallback: show groupedComponents (covers case activeCategory missing)
    return groupedComponents;
  }, [activeCategory, filteredComponents, groupedComponents]);

  /* ----------------------------------------
     Render
  ----------------------------------------- */

  return (
    <div className="p-3 space-y-3 text-gray-100 ">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Component Library
        </p>
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
      </div>

      {/* Search */}
      <div className="px-2 flex items-center gap-1.5 rounded-md border border-white/5 bg-[#020617] focus-within:border-blue-500/40 transition-colors">
        <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components…"
          className="bg-transparent text-[11px] text-gray-200 placeholder-gray-500 outline-none py-1.5 flex-1"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1 px-2 max-h-20 overflow-y-auto">
        {["all", ...availableCategories].map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(
                  cat === "all" ? "all" : (cat as ComponentCategory)
                )
              }
              className={`px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap transition-colors
                ${
                  active
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : "border-white/10 text-gray-400 hover:bg-white/5"
                }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          );
        })}
      </div>

      {/* Component groups (uses displayGroups so "All" is non-empty) */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {Object.entries(displayGroups).map(([category, comps]) => (
          <div key={category}>
            <p className="px-2 pt-2 pb-1 text-[9px] uppercase tracking-wider text-gray-500">
              {category}
            </p>

            <div className="space-y-1">
              {comps.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => handleAddComponent(comp)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left text-xs rounded-md
                    text-gray-300 transition-colors
                    hover:bg-white/5 hover:text-gray-100 group"
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded-md
                    bg-white/5 text-gray-300
                    group-hover:bg-blue-500/15 group-hover:text-blue-300"
                  >
                    {COMPONENT_ICONS[comp.type] ?? FALLBACK_ICON}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium truncate text-gray-200">
                        {comp.label}
                      </p>
                      {comp.isLayout && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300">
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
                    className="shrink-0 text-gray-500 group-hover:text-blue-400 transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(displayGroups).length === 0 && (
          <p className="text-[11px] text-gray-500 px-2 py-3 text-center">
            No components match your search.
          </p>
        )}
      </div>
    </div>
  );
}
