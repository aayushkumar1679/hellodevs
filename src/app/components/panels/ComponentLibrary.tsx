"use client";

import React, { useMemo, useState } from "react";
import { useProjectStore } from "@/state/useProjectStore";
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
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  COMPONENT_LIBRARY,
  ComponentDefinition,
  ComponentCategory,
} from "@/config/componentRegistry";
import { motion, AnimatePresence } from "framer-motion";

const ICONS: Record<string, React.ReactNode> = {
  section: <LayoutTemplate size={11} />,
  "flex-row": <Rows size={11} />,
  "flex-column": <Columns size={11} />,
  grid: <Grid3x3 size={11} />,
  container: <Box size={11} />,
  spacer: <Minus size={11} />,
  divider: <Minus size={11} />,
  navbar: <Navigation size={11} />,
  "feature-section": <Grid3x3 size={11} />,
  "testimonial-section": <Rows size={11} />,
  card: <Square size={11} />,
  heading: <Type size={11} />,
  text: <FileText size={11} />,
  image: <ImageIcon size={11} />,
  button: <MousePointerClick size={11} />,
  badge: <BadgeCheck size={11} />,
  alert: <AlertTriangle size={11} />,
};

const FALLBACK = <Square size={11} />;

/* Category accent colours */
const CAT_COLORS: Record<string, string> = {
  layout: "text-sky-400",
  navigation: "text-violet-400",
  content: "text-emerald-400",
  marketing: "text-amber-400",
  media: "text-rose-400",
  feedback: "text-orange-400",
  commerce: "text-indigo-400",
};

export default function ComponentLibrary() {
  const { addComponent } = useProjectStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ComponentCategory | "all"
  >("all");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [variations, setVariations] = useState<unknown[]>([]);

  const handleGenerate = async (type: string) => {
    setIsGenerating(type);
    try {
      const resp = await fetch("/api/generate/variant", {
        method: "POST",
        body: JSON.stringify({ componentType: type }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      // Transform blueprint into a "synthetic" component definition
      const newComp = {
        type: `${type}_v${Date.now()}`,
        baseType: type,
        label: `${type} (Variant)`,
        description: `AI-Generated ${type} variation.`,
        category: "other" as ComponentCategory,
        blueprint: data.blueprint,
        isSynthetic: true,
      };

      setVariations((prev) => [newComp, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const allComponents = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const synthetic = variations.map((v: any) => ({
      ...v,
      category: COMPONENT_LIBRARY.find(c => c.type === v.baseType)?.category || "other"
    }));
    return [...synthetic, ...COMPONENT_LIBRARY];
  }, [variations]);

  const availableCategories = useMemo(
    () => Array.from(new Set(allComponents.map((c) => c.category))).sort(),
    [allComponents],
  );

  const filtered = useMemo(() => {
    return allComponents.filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory)
        return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.label.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, search, allComponents]);

  /* Group by category when "all" is selected */
  const groups = useMemo(() => {
    if (activeCategory !== "all") return { [activeCategory]: filtered };
    const g: Record<string, ComponentDefinition[]> = {};
    filtered.forEach((c) => {
      if (!g[c.category]) g[c.category] = [];
      g[c.category].push(c);
    });
    return g;
  }, [activeCategory, filtered]);

  return (
    <div className="flex h-full flex-col bg-[#111114] text-white">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex-shrink-0 space-y-2 border-b border-white/[0.06] p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
          Components
        </p>

        {/* Search */}
        <div className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 transition focus-within:border-white/15 focus-within:bg-white/[0.06]">
          <Search className="h-3 w-3 flex-shrink-0 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-[10px] text-white/60 outline-none placeholder:text-white/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-white/25 hover:text-white/50"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1">
          {["all", ...availableCategories].map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(cat as ComponentCategory | "all")
                }
                className={`rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-wider transition-all ${
                  active
                    ? "bg-violet-600/80 text-white"
                    : "border border-white/[0.07] text-white/25 hover:border-white/15 hover:text-white/50"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto p-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {Object.entries(groups).map(([group, components]) => (
            <motion.div
              key={group}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3"
            >
              <p
                className={`mb-1 px-1 text-[8px] font-black uppercase tracking-[0.22em] ${CAT_COLORS[group] ?? "text-white/25"}`}
              >
                {group}
              </p>
              <div className="space-y-0.5">
                {components.map((comp) => (
                  <motion.button
                    key={comp.type}
                    layout
                    onClick={() => addComponent(comp.type, undefined, undefined, comp.blueprint)}
                    whileTap={{ scale: 0.97 }}
                    className="group flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition-all hover:border-white/[0.07] hover:bg-white/[0.04]"
                    draggable
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onDragStart={(e: any) => {
                      e.dataTransfer.setData("polyglot/type", comp.type);
                    }}
                  >
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] transition-all group-hover:border-violet-500/30 group-hover:bg-violet-500/10 ${CAT_COLORS[comp.category] ?? "text-white/30"}`}
                    >
                      {ICONS[comp.type] || ICONS[comp.baseType] || FALLBACK}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="truncate text-[10px] font-semibold text-white/60 group-hover:text-white/80">
                          {comp.label}
                        </span>
                        {comp.isSynthetic && (
                          <span className="flex-shrink-0 rounded bg-amber-500/10 px-1 py-0.5 text-[7px] font-black uppercase tracking-wider text-amber-400">
                            AI
                          </span>
                        )}
                        {comp.isLayout && (
                          <span className="flex-shrink-0 rounded bg-sky-500/10 px-1 py-0.5 text-[7px] font-black uppercase tracking-wider text-sky-400">
                            Layout
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[9px] text-white/20">
                        {comp.description}
                      </p>
                    </div>
                    
                    {!comp.isSynthetic && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerate(comp.type);
                        }}
                        disabled={!!isGenerating}
                        className="group/sparkle flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.04] text-white/25 transition hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
                      >
                        {isGenerating === comp.type ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                      </button>
                    )}
                    
                    <Plus className="h-3 w-3 flex-shrink-0 text-white/15 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-violet-400" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-5 w-5 text-white/10 mb-2" />
            <p className="text-[10px] text-white/25">No components found</p>
          </div>
        )}
      </div>
    </div>
  );
}
