"use client";

import React, { useMemo, useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import {
  Plus,
  Search,
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
import { motion, AnimatePresence } from "framer-motion";

interface ComponentLibraryProps {
  categories?: ComponentCategory[];
  onComponentAdd?: (def: ComponentDefinition, id: string) => void;
}

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  section: <LayoutTemplate size={13} />,
  "flex-row": <Rows size={13} />,
  "flex-column": <Columns size={13} />,
  grid: <Grid3x3 size={13} />,
  container: <Box size={13} />,
  spacer: <Minus size={13} />,
  divider: <Minus size={13} />,
  navbar: <Navigation size={13} />,
  "feature-section": <Grid3x3 size={13} />,
  "testimonial-section": <Rows size={13} />,
  "pricing-section": <Columns size={13} />,
  "stats-strip": <LayoutTemplate size={13} />,
  card: <Square size={13} />,
  heading: <Type size={13} />,
  text: <FileText size={13} />,
  image: <ImageIcon size={13} />,
  button: <MousePointerClick size={13} />,
  badge: <BadgeCheck size={13} />,
  alert: <AlertTriangle size={13} />,
};

const FALLBACK_ICON = <Square size={13} />;

export default function ComponentLibrary({ categories, onComponentAdd }: ComponentLibraryProps) {
  const { addComponent } = useCanvasStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all");

  const handleAddComponent = (def: ComponentDefinition) => {
    const componentId = addComponent(def.type);
    onComponentAdd?.(def, componentId);
  };

  const availableCategories = useMemo(
    () => Array.from(new Set(COMPONENT_LIBRARY.map((c) => c.category))).sort(),
    []
  );

  const filteredComponents = useMemo(() => {
    return COMPONENT_LIBRARY.filter((component) => {
      if (categories && !categories.includes(component.category)) return false;
      if (activeCategory !== "all" && component.category !== activeCategory) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        component.label.toLowerCase().includes(q) ||
        component.type.toLowerCase().includes(q) ||
        component.description.toLowerCase().includes(q)
      );
    });
  }, [categories, activeCategory, search]);

  const displayGroups = useMemo(() => {
    if (activeCategory === "all") return { "All Components": filteredComponents };
    return { [activeCategory]: filteredComponents };
  }, [activeCategory, filteredComponents]);

  return (
    <div className="space-y-3 p-3">
      {/* Header */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Library</p>
        <h2 className="mt-0.5 text-[12px] font-black text-slate-950">Add Components</h2>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm focus-within:border-slate-400 transition-colors">
        <Search className="h-3 w-3 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1">
        {["all", ...availableCategories].map((cat) => {
          const active = activeCategory === cat;
          return (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(active ? "all" : (cat as ComponentCategory | "all"))}
              className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wide transition-all ${
                active
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
            >
              {cat === "all" ? "All" : cat}
            </motion.button>
          );
        })}
      </div>

      {/* Component List */}
      <div className="space-y-3 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {Object.entries(displayGroups).map(([group, components]) => (
            <motion.div
              key={group}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <p className="px-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{group}</p>

              <div className="space-y-0.5">
                {components.map((component, i) => (
                  <motion.button
                    key={component.type}
                    layout
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleAddComponent(component)}
                    className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2 text-left transition-all duration-150 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-amber-100 group-hover:text-amber-700">
                      {COMPONENT_ICONS[component.type] ?? FALLBACK_ICON}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[11px] font-bold text-slate-900">{component.label}</p>
                        {component.isLayout && (
                          <span className="shrink-0 rounded-md bg-sky-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-sky-600">
                            Layout
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[9px] text-slate-400">{component.description}</p>
                    </div>

                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-all group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white group-hover:rotate-90">
                      <Plus size={10} />
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredComponents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center"
          >
            <Search className="mx-auto h-5 w-5 text-slate-200 mb-2" />
            <p className="text-[11px] font-medium text-slate-400">No components found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
