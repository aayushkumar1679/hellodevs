"use client";

import React, { useMemo, useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
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
import { motion, AnimatePresence } from "framer-motion";

interface ComponentLibraryProps {
  categories?: ComponentCategory[];
  onComponentAdd?: (def: ComponentDefinition, id: string) => void;
}

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  section: <LayoutTemplate size={16} />,
  "flex-row": <Rows size={16} />,
  "flex-column": <Columns size={16} />,
  grid: <Grid3x3 size={16} />,
  container: <Box size={16} />,
  spacer: <Minus size={16} />,
  divider: <Minus size={16} />,
  navbar: <Navigation size={16} />,
  "feature-section": <Grid3x3 size={16} />,
  "testimonial-section": <Rows size={16} />,
  "pricing-section": <Columns size={16} />,
  "stats-strip": <LayoutTemplate size={16} />,
  card: <Square size={16} />,
  heading: <Type size={16} />,
  text: <FileText size={16} />,
  image: <ImageIcon size={16} />,
  button: <MousePointerClick size={16} />,
  badge: <BadgeCheck size={16} />,
  alert: <AlertTriangle size={16} />,
};

const FALLBACK_ICON = <Square size={16} />;

export default function ComponentLibrary({
  categories,
  onComponentAdd,
}: ComponentLibraryProps) {
  const { addComponent } = useCanvasStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ComponentCategory | "all"
  >("all");

  const handleAddComponent = (def: ComponentDefinition) => {
    const componentId = addComponent(def.type);
    onComponentAdd?.(def, componentId);
  };

  const availableCategories = useMemo(
    () => Array.from(new Set(COMPONENT_LIBRARY.map((component) => component.category))).sort(),
    []
  );

  const filteredComponents = useMemo(() => {
    return COMPONENT_LIBRARY.filter((component) => {
      if (categories && !categories.includes(component.category)) return false;
      if (activeCategory !== "all" && component.category !== activeCategory) {
        return false;
      }
      if (!search.trim()) return true;

      const query = search.toLowerCase();
      return (
        component.label.toLowerCase().includes(query) ||
        component.type.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query)
      );
    });
  }, [categories, activeCategory, search]);

  const displayGroups = useMemo(() => {
    if (activeCategory === "all") {
      return { "All Components": filteredComponents };
    }

    return {
      [activeCategory]: filteredComponents,
    };
  }, [activeCategory, filteredComponents]);

  return (
    <div className="space-y-4 p-4 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Component Library
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            Build the layout by hand
          </h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 shadow-sm">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search components..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-slate-400 transition hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <motion.div 
        layout
        className="flex flex-wrap gap-2"
      >
        {["all", ...availableCategories].map((category) => {
          const active = activeCategory === category;
          return (
            <motion.button
              key={category}
              layout
              onClick={() =>
                setActiveCategory(
                  category === "all"
                    ? "all"
                    : (category as ComponentCategory)
                )
              }
              className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-lg scale-105"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950"
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {category === "all" ? "All" : category}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {Object.entries(displayGroups).map(([group, components]) => (
              <motion.div 
                key={group}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {group}
                </p>

                <div className="space-y-3">
                  {components.map((component) => (
                    <motion.button
                      key={component.type}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleAddComponent(component)}
                      className="group flex w-full items-center gap-4 rounded-[28px] border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition-all duration-300 hover:border-slate-400 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-slate-100 text-slate-600 transition-colors group-hover:bg-amber-100 group-hover:text-amber-700">
                        {COMPONENT_ICONS[component.type] ?? FALLBACK_ICON}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[15px] font-black tracking-tight text-slate-950">
                            {component.label}
                          </p>
                          {component.isLayout && (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-sky-600 ring-1 ring-sky-200/50">
                              Layout
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500 font-medium">
                          {component.description}
                        </p>
                      </div>

                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white group-hover:rotate-90">
                        <Plus size={16} />
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
              className="rounded-2xl border border-dashed border-slate-300 px-4 py-12 text-center"
            >
              <Search className="mx-auto h-8 w-8 text-slate-200 mb-4" />
              <p className="text-sm font-medium text-slate-500">
                No components match your search.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
