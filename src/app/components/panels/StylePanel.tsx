"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  Layout,
  Palette,
  Type,
  Zap,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { useProjectStore, type CSSProperties } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import UnitInput from "../ui/UnitInput";
import ColorInput from "../ui/ColorInput";
import VisualSelect from "../ui/VisualSelect";
import SpacingDiagram from "../ui/SpacingDiagram";
import { motion, AnimatePresence } from "framer-motion";

type BreakpointKey = "desktop" | "tablet" | "mobile";
const toBucket = (bp: BreakpointKey) => (bp === "desktop" ? "base" : bp);

function Section({
  id, title, icon: Icon, open, onToggle, children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white transition-all hover:border-slate-200">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-slate-50/70"
      >
        <div className="flex items-center gap-2">
          <div className={`flex h-5 w-5 items-center justify-center rounded-md transition-all ${
            open ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-400"
          }`}>
            <Icon className="h-3 w-3" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
            {title}
          </span>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-slate-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-3 border-t border-slate-100 bg-slate-50/30 px-3 py-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StylePanel() {
  const selectedElements = useEditorStore((state) => state.selectedElements);
  const { activeBreakpoint } = useEditorStore();
  const { currentProject } = useProjectStore();
  const _updateCSS = useProjectStore((state) => state.updateComponentCSSOverride);
  const updateCSSProperty = (id: string, key: string, value: unknown) => {
    _updateCSS(id, activeBreakpoint, key, value);
  };

  const [expanded, setExpanded] = useState<string[]>(["position", "layout", "surface"]);

  const hasSelection = selectedElements.length > 0;
  const primaryId = hasSelection ? selectedElements[0] : null;
  const element = primaryId ? currentProject?.components[primaryId] : null;
  const bucket = toBucket(activeBreakpoint as BreakpointKey);

  const css = useMemo(() => {
    const cssAll = element?.cssOverrides ?? { base: {} };
    return { ...(cssAll.base ?? {}), ...(cssAll[bucket] ?? {}) };
  }, [bucket, element]);

  const getCssValue = (key: string, fallback = "") => {
    const value = css[key];
    return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
  };

  const toggleSection = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentType = (primaryId && currentProject?.components?.[primaryId]?.type) || "Element";
  const displayValue = getCssValue("display", "block");
  const flexDirectionValue = getCssValue("flexDirection", "row");
  const backgroundValue = getCssValue("background") || getCssValue("backgroundColor");
  const textAlignValue = getCssValue("textAlign", "left");

  if (!hasSelection || !primaryId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
          <Layout className="h-6 w-6" />
        </div>
        <p className="text-[11px] font-bold text-slate-500">No selection</p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
          Click any element on the canvas to edit its styles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Selected Element Badge */}
      <div className="mb-3 rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Selected</p>
            <p className="mt-0.5 text-[13px] font-black capitalize italic tracking-tight text-slate-900">
              {currentType}
            </p>
            <p className="text-[9px] font-mono text-slate-400">#{primaryId.slice(0, 8)}</p>
          </div>
          <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sky-600 ring-1 ring-sky-200/50">
            {activeBreakpoint}
          </span>
        </div>
      </div>

      <Section id="position" title="Position" icon={Move} open={expanded.includes("position")} onToggle={toggleSection}>
        <VisualSelect
          label="Position"
          value={getCssValue("position", "static")}
          onChange={(val) => updateCSSProperty(primaryId, "position", val)}
          options={[
            { value: "static", label: "Static", icon: Layout },
            { value: "relative", label: "Relative", icon: Layout },
            { value: "absolute", label: "Absolute", icon: Layout },
            { value: "fixed", label: "Fixed", icon: Layout },
            { value: "sticky", label: "Sticky", icon: Layout },
          ]}
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <UnitInput label="Top" value={getCssValue("top")} onChange={(val) => updateCSSProperty(primaryId, "top", val)} placeholder="auto" />
          <UnitInput label="Right" value={getCssValue("right")} onChange={(val) => updateCSSProperty(primaryId, "right", val)} placeholder="auto" />
          <UnitInput label="Bottom" value={getCssValue("bottom")} onChange={(val) => updateCSSProperty(primaryId, "bottom", val)} placeholder="auto" />
          <UnitInput label="Left" value={getCssValue("left")} onChange={(val) => updateCSSProperty(primaryId, "left", val)} placeholder="auto" />
        </div>
        <div className="mt-2">
           <VisualSelect
            label="Overflow"
            value={getCssValue("overflow", "visible")}
            onChange={(val) => updateCSSProperty(primaryId, "overflow", val)}
            options={[
              { value: "visible", label: "Visible", icon: Layout },
              { value: "hidden", label: "Hidden", icon: Layout },
              { value: "auto", label: "Auto", icon: Layout },
              { value: "scroll", label: "Scroll", icon: Layout },
            ]}
          />
        </div>
      </Section>

      <Section id="layout" title="Layout" icon={Layout} open={expanded.includes("layout")} onToggle={toggleSection}>
        <VisualSelect
          label="Display"
          value={displayValue}
          onChange={(val) => updateCSSProperty(primaryId, "display", val)}
          options={[
            { value: "block", label: "Block", icon: Layout },
            { value: "flex", label: "Flex", icon: ArrowRight },
            { value: "grid", label: "Grid", icon: Layout },
            { value: "none", label: "Hidden", icon: Zap },
          ]}
        />
        <div className="grid grid-cols-2 gap-2">
          <UnitInput label="Width" value={getCssValue("width")} onChange={(val) => updateCSSProperty(primaryId, "width", val)} placeholder="Auto" />
          <UnitInput label="Height" value={getCssValue("height")} onChange={(val) => updateCSSProperty(primaryId, "height", val)} placeholder="Auto" />
        </div>
        {(displayValue === "flex" || displayValue === "grid") && (
          <div className="space-y-2.5 rounded-lg bg-slate-100/60 p-2.5">
            <VisualSelect
              label="Direction"
              value={flexDirectionValue}
              onChange={(val) => updateCSSProperty(primaryId, "flexDirection", val)}
              options={[
                { value: "row", label: "Row", icon: ArrowRight },
                { value: "column", label: "Col", icon: ArrowDown },
              ]}
            />
            <UnitInput label="Gap" value={getCssValue("gap")} onChange={(val) => updateCSSProperty(primaryId, "gap", val)} placeholder="0px" />
          </div>
        )}
      </Section>

      <Section id="spacing" title="Spacing" icon={Move} open={expanded.includes("spacing")} onToggle={toggleSection}>
        <SpacingDiagram
          margin={{
            top: getCssValue("marginTop") || getCssValue("margin") || "0px",
            right: getCssValue("marginRight") || getCssValue("margin") || "0px",
            bottom: getCssValue("marginBottom") || getCssValue("margin") || "0px",
            left: getCssValue("marginLeft") || getCssValue("margin") || "0px",
          }}
          padding={{
            top: getCssValue("paddingTop") || getCssValue("padding") || "0px",
            right: getCssValue("paddingRight") || getCssValue("padding") || "0px",
            bottom: getCssValue("paddingBottom") || getCssValue("padding") || "0px",
            left: getCssValue("paddingLeft") || getCssValue("padding") || "0px",
          }}
          onMarginChange={(side, val) => {
            const key = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
            updateCSSProperty(primaryId, key, val.includes("px") || val === "auto" ? val : `${val}px`);
          }}
          onPaddingChange={(side, val) => {
            const key = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
            updateCSSProperty(primaryId, key, val.includes("px") ? val : `${val}px`);
          }}
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <UnitInput label="Padding (All)" value={getCssValue("padding")} onChange={(val) => updateCSSProperty(primaryId, "padding", val)} placeholder="0px" />
          <UnitInput label="Margin (All)" value={getCssValue("margin")} onChange={(val) => updateCSSProperty(primaryId, "margin", val)} placeholder="0px" />
        </div>
      </Section>

      <Section id="surface" title="Surface" icon={Palette} open={expanded.includes("surface")} onToggle={toggleSection}>
        <ColorInput label="Background" value={backgroundValue} onChange={(val) => updateCSSProperty(primaryId, "background", val)} />
        <ColorInput label="Text Color" value={getCssValue("color")} onChange={(val) => updateCSSProperty(primaryId, "color", val)} />
        <div className="grid grid-cols-2 gap-2">
          <UnitInput label="Radius" value={getCssValue("borderRadius")} onChange={(val) => updateCSSProperty(primaryId, "borderRadius", val)} placeholder="0px" />
          <UnitInput label="Border" value={getCssValue("borderWidth")} onChange={(val) => updateCSSProperty(primaryId, "borderWidth", val)} placeholder="0px" />
        </div>
      </Section>

      <Section id="typography" title="Typography" icon={Type} open={expanded.includes("typography")} onToggle={toggleSection}>
        {/* Font Family Picker */}
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Font Family</p>
          <select
            value={getCssValue("fontFamily", "")}
            onChange={(e) => updateCSSProperty(primaryId, "fontFamily", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-800 shadow-sm transition hover:border-slate-300 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-200"
          >
            <option value="">— Default —</option>
            <option value="var(--font-manrope), sans-serif">Manrope</option>
            <option value="var(--font-space-grotesk), sans-serif">Space Grotesk</option>
            <option value="var(--font-inter), sans-serif">Inter</option>
            <option value="var(--font-plus-jakarta-sans), sans-serif">Plus Jakarta Sans</option>
            <option value="var(--font-outfit), sans-serif">Outfit</option>
            <option value="var(--font-dm-sans), sans-serif">DM Sans</option>
            <option value="var(--font-sora), sans-serif">Sora</option>
            <option value="Georgia, serif">Georgia (Serif)</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <UnitInput label="Font Size" value={getCssValue("fontSize")} onChange={(val) => updateCSSProperty(primaryId, "fontSize", val)} placeholder="16px" />
          <UnitInput label="Line Height" value={getCssValue("lineHeight")} onChange={(val) => updateCSSProperty(primaryId, "lineHeight", val)} placeholder="1.5" />
        </div>
        <VisualSelect
          label="Alignment"
          value={textAlignValue}
          onChange={(val) => updateCSSProperty(primaryId, "textAlign", val)}
          options={[
            { value: "left", label: "Left", icon: AlignLeft },
            { value: "center", label: "Center", icon: AlignCenter },
            { value: "right", label: "Right", icon: AlignRight },
            { value: "justify", label: "Justify", icon: AlignJustify },
          ]}
        />
        <div className="grid grid-cols-2 gap-2">
          <UnitInput label="Font Weight" value={getCssValue("fontWeight")} onChange={(val) => updateCSSProperty(primaryId, "fontWeight", val)} units={[""]} placeholder="400" />
          <UnitInput label="Letter Spacing" value={getCssValue("letterSpacing")} onChange={(val) => updateCSSProperty(primaryId, "letterSpacing", val)} placeholder="0em" />
        </div>
      </Section>

      <Section id="effects" title="Effects" icon={Zap} open={expanded.includes("effects")} onToggle={toggleSection}>
        <div className="grid grid-cols-2 gap-2">
          <UnitInput label="Opacity" value={getCssValue("opacity", "1")} onChange={(val) => updateCSSProperty(primaryId, "opacity", val)} units={[""]} placeholder="1" />
          <UnitInput label="Z-Index" value={getCssValue("zIndex", "0")} onChange={(val) => updateCSSProperty(primaryId, "zIndex", val)} units={[""]} placeholder="0" />
        </div>
        <UnitInput label="Blur" value={getCssValue("backdropFilter")} onChange={(val) => updateCSSProperty(primaryId, "backdropFilter", `blur(${val})`)} units={["px"]} placeholder="0px" />
      </Section>
    </div>
  );
}

