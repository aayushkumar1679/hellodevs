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
import { useDesignStore, type ResponsiveCss } from "@/state/useDesignStore";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useEditorStore } from "@/state/useEditorStore";

// God Tier controls
import UnitInput from "../ui/UnitInput";
import ColorInput from "../ui/ColorInput";
import VisualSelect from "../ui/VisualSelect";

type BreakpointKey = "desktop" | "tablet" | "mobile";
const toBucket = (bp: BreakpointKey) => (bp === "desktop" ? "base" : bp);

function Section({
  id,
  title,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 overflow-hidden rounded-[20px] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md transition-all hover:border-slate-300/80">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-800">{title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="space-y-5 border-t border-slate-100 bg-white/30 px-4 py-5 animate-in fade-in slide-in-from-top-1">
          {children}
        </div>
      )}
    </div>
  );
}

export default function StylePanel() {
  const selectedElements = useDesignStore((state) => state.selectedElements);
  const elements = useDesignStore((state) => state.elements);
  const updateCSSProperty = useDesignStore((state) => state.updateCSSProperty);
  const { currentProject } = useCanvasStore();
  const { activeBreakpoint } = useEditorStore();

  const [expanded, setExpanded] = useState<string[]>([
    "layout",
    "surface",
  ]);

  const hasSelection = selectedElements.length > 0;
  const primaryId = hasSelection ? selectedElements[0] : null;
  const element = primaryId ? elements[primaryId] : null;
  const bucket = toBucket(activeBreakpoint as BreakpointKey);
  const cssAll: ResponsiveCss = element?.cssProperties || { base: {} };
  
  // Local styles for this bucket
  const css = useMemo(
    () => ({ ...(cssAll.base || {}), ...(cssAll[bucket] || {}) }),
    [bucket, cssAll]
  );

  const toggleSection = (id: string) => {
    setExpanded((state) =>
      state.includes(id)
        ? state.filter((item) => item !== id)
        : [...state, id]
    );
  };

  const currentType =
    (primaryId && currentProject?.components?.[primaryId]?.type) || "Element";

  if (!hasSelection || !primaryId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-slate-50 text-slate-200">
          <Layout className="h-10 w-10" />
        </div>
        <p className="text-sm font-semibold text-slate-900">No selection</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Select an element on the canvas to customize its layout, color, and 3D effects.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4">
      {/* Header Info */}
      <div className="mb-6 rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Selected Node
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-base font-black tracking-tight text-slate-900 capitalize italic">
              {currentType}
            </p>
            <p className="text-[10px] font-medium text-slate-500">#{primaryId.slice(0, 8)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-600 ring-1 ring-sky-200/50">
              {activeBreakpoint}
            </span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <Section
        id="layout"
        title="Layout"
        icon={Layout}
        open={expanded.includes("layout")}
        onToggle={toggleSection}
      >
        <VisualSelect
          label="Display"
          value={css.display || "block"}
          onChange={(val) => updateCSSProperty(primaryId, "display", val)}
          options={[
            { value: "block", label: "Block", icon: Layout },
            { value: "flex", label: "Flex", icon: ArrowRight },
            { value: "grid", label: "Grid", icon: Layout },
            { value: "none", label: "Hidden", icon: Zap },
          ]}
        />

        <div className="grid grid-cols-2 gap-4">
          <UnitInput
            label="Width"
            value={css.width || ""}
            onChange={(val) => updateCSSProperty(primaryId, "width", val)}
            placeholder="Auto"
          />
          <UnitInput
            label="Height"
            value={css.height || ""}
            onChange={(val) => updateCSSProperty(primaryId, "height", val)}
            placeholder="Auto"
          />
        </div>

        {(css.display === "flex" || css.display === "grid") && (
          <div className="space-y-5 rounded-[18px] bg-slate-50/80 p-4">
             <VisualSelect
                label="Direction"
                value={css.flexDirection || "row"}
                onChange={(val) => updateCSSProperty(primaryId, "flexDirection", val)}
                options={[
                  { value: "row", label: "Row", icon: ArrowRight },
                  { value: "column", label: "Column", icon: ArrowDown },
                ]}
              />
              <UnitInput
                label="Gap"
                value={css.gap || ""}
                onChange={(val) => updateCSSProperty(primaryId, "gap", val)}
                placeholder="0px"
              />
          </div>
        )}
      </Section>

      <Section
        id="spacing"
        title="Spacing"
        icon={Move}
        open={expanded.includes("spacing")}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-2 gap-4">
          <UnitInput
            label="Padding"
            value={css.padding || ""}
            onChange={(val) => updateCSSProperty(primaryId, "padding", val)}
            placeholder="0px"
          />
          <UnitInput
            label="Margin"
            value={css.margin || ""}
            onChange={(val) => updateCSSProperty(primaryId, "margin", val)}
            placeholder="0px"
          />
        </div>
      </Section>

      <Section
        id="surface"
        title="Surface"
        icon={Palette}
        open={expanded.includes("surface")}
        onToggle={toggleSection}
      >
        <ColorInput
          label="Background"
          value={css.background || css.backgroundColor || ""}
          onChange={(val) => updateCSSProperty(primaryId, "background", val)}
        />
        
        <div className="grid grid-cols-1 gap-4">
          <ColorInput
            label="Text Color"
            value={css.color || ""}
            onChange={(val) => updateCSSProperty(primaryId, "color", val)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <UnitInput
            label="Corner Radius"
            value={css.borderRadius || ""}
            onChange={(val) => updateCSSProperty(primaryId, "borderRadius", val)}
            placeholder="0px"
          />
           <UnitInput
            label="Border Width"
            value={css.borderWidth || ""}
            onChange={(val) => updateCSSProperty(primaryId, "borderWidth", val)}
            placeholder="0px"
          />
        </div>
      </Section>

      <Section
        id="typography"
        title="Typography"
        icon={Type}
        open={expanded.includes("typography")}
        onToggle={toggleSection}
      >
         <div className="grid grid-cols-2 gap-4">
          <UnitInput
            label="Font Size"
            value={css.fontSize || ""}
            onChange={(val) => updateCSSProperty(primaryId, "fontSize", val)}
            placeholder="16px"
          />
          <UnitInput
            label="Line Height"
            value={css.lineHeight || ""}
            onChange={(val) => updateCSSProperty(primaryId, "lineHeight", val)}
            placeholder="1.5"
          />
        </div>
        
        <VisualSelect
          label="Alignment"
          value={css.textAlign || "left"}
          onChange={(val) => updateCSSProperty(primaryId, "textAlign", val)}
          options={[
            { value: "left", label: "Left", icon: AlignLeft },
            { value: "center", label: "Center", icon: AlignCenter },
            { value: "right", label: "Right", icon: AlignRight },
            { value: "justify", label: "Justify", icon: AlignJustify },
          ]}
        />
      </Section>

      <Section
        id="effects"
        title="Effects"
        icon={Zap}
        open={expanded.includes("effects")}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-2 gap-4">
          <UnitInput
            label="Opacity"
            value={css.opacity ?? "1"}
            onChange={(val) => updateCSSProperty(primaryId, "opacity", val)}
            units={[""]}
            placeholder="1"
          />
          <UnitInput
            label="Z-Index"
            value={css.zIndex ?? "0"}
            onChange={(val) => updateCSSProperty(primaryId, "zIndex", val)}
            units={[""]}
            placeholder="0"
          />
        </div>
        <div className="space-y-4">
           <UnitInput
            label="Blur"
            value={css.backdropFilter || ""}
            onChange={(val) => updateCSSProperty(primaryId, "backdropFilter", `blur(${val})`)}
            units={["px"]}
            placeholder="0px"
          />
        </div>
      </Section>
    </div>
  );
}
