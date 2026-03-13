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

      <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
        {["all", ...availableCategories].map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() =>
                setActiveCategory(
                  category === "all"
                    ? "all"
                    : (category as ComponentCategory)
                )
              }
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
              }`}
            >
              {category === "all" ? "All" : category}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        {Object.entries(displayGroups).map(([group, components]) => (
          <div key={group}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {group}
            </p>

            <div className="space-y-2">
              {components.map((component) => (
                <button
                  key={component.type}
                  onClick={() => handleAddComponent(component)}
                  className="group flex w-full items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-amber-100 group-hover:text-amber-800">
                    {COMPONENT_ICONS[component.type] ?? FALLBACK_ICON}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {component.label}
                      </p>
                      {component.isLayout && (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                          Layout
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {component.description}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white">
                    <Plus size={14} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredComponents.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
            No components match that search.
          </p>
        )}
      </div>
    </div>
  );
}
