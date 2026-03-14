"use client";

import React, { useState, useCallback } from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import type { Breakpoint } from "@/state/useEditorStore";
import type { CSSProperties } from "@/state/useProjectStore";
import { ChevronRight, RotateCcw } from "lucide-react";

/* ─── Tiny helpers ────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
      {children}
    </span>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-1.5 text-left transition hover:text-white/60"
    >
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
        {label}
      </span>
      <ChevronRight
        className={`h-3 w-3 text-white/20 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
      />
    </button>
  );
}

/* ─── Input atom ──────────────────────────────────────────── */
function CSSInput({
  label,
  prop,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  prop: string;
  value: string;
  onChange: (prop: string, val: string) => void;
  placeholder?: string;
  type?: "text" | "color";
}) {
  if (type === "color") {
    return (
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-1.5">
          <label className="relative h-5 w-5 cursor-pointer overflow-hidden rounded-md border border-white/10">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(prop, e.target.value)}
              className="absolute -inset-1 h-8 w-8 cursor-pointer opacity-0"
            />
            <div
              className="h-full w-full rounded-md"
              style={{ backgroundColor: value || "#000000" }}
            />
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(prop, e.target.value)}
            placeholder="#000000"
            className="w-20 rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-white/60 outline-none transition focus:border-violet-500/40 focus:bg-white/[0.07] focus:text-white/90"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(prop, e.target.value)}
        placeholder={placeholder}
        className="w-24 rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-white/60 outline-none transition focus:border-violet-500/40 focus:bg-white/[0.07] focus:text-white/90"
      />
    </div>
  );
}

/* ─── Select atom ─────────────────────────────────────────── */
function CSSSelect({
  label,
  prop,
  value,
  options,
  onChange,
}: {
  label: string;
  prop: string;
  value: string;
  options: { value: string; label?: string }[];
  onChange: (prop: string, val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(prop, e.target.value)}
        className="w-28 rounded-md border border-white/[0.07] bg-[#1A1A1E] px-2 py-0.5 text-[10px] text-white/60 outline-none transition focus:border-violet-500/40 focus:text-white/90 appearance-none cursor-pointer"
      >
        <option value="">— none —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label ?? o.value}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─── Spacing visual input (4 sides) ──────────────────────── */
function SpacingQuad({
  label,
  propPrefix,
  values,
  onChange,
}: {
  label: string;
  propPrefix: "padding" | "margin";
  values: { top: string; right: string; bottom: string; left: string };
  onChange: (prop: string, val: string) => void;
}) {
  const SIDES = ["Top", "Right", "Bottom", "Left"] as const;
  const KEYS = [
    `${propPrefix}Top`,
    `${propPrefix}Right`,
    `${propPrefix}Bottom`,
    `${propPrefix}Left`,
  ] as const;

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 grid grid-cols-4 gap-1">
        {SIDES.map((side, i) => (
          <div key={side} className="flex flex-col items-center gap-0.5">
            <input
              type="text"
              value={
                side === "Top"
                  ? values.top
                  : side === "Right"
                    ? values.right
                    : side === "Bottom"
                      ? values.bottom
                      : values.left
              }
              onChange={(e) => onChange(KEYS[i], e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-white/[0.07] bg-white/[0.04] p-1 text-center text-[10px] font-mono text-white/60 outline-none transition focus:border-violet-500/40 focus:text-white/80"
            />
            <span className="text-[8px] text-white/20">{side[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Breakpoint pill strip ────────────────────────────────── */
function BreakpointStrip({
  active,
  onChange,
}: {
  active: Breakpoint;
  onChange: (bp: Breakpoint) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
      {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => (
        <button
          key={bp}
          onClick={() => onChange(bp)}
          className={`flex-1 rounded-md py-0.5 text-[8px] font-black uppercase tracking-widest transition-all ${
            active === bp
              ? "bg-violet-600/80 text-white"
              : "text-white/25 hover:text-white/50"
          }`}
        >
          {bp === "desktop" ? "DT" : bp === "tablet" ? "TB" : "MB"}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN STYLE PANEL
════════════════════════════════════════════════════════════ */

export default function StylePanel() {
  const selectedElements = useEditorStore((s) => s.selectedElements ?? []);
  const { activeBreakpoint, setBreakpoint } = useEditorStore();
  const currentProject = useProjectStore((s) => s.currentProject);
  const updateCSSOverride = useProjectStore(
    (s) => s.updateComponentCSSOverride,
  );
  const getResolvedCss = useProjectStore((s) => s.getResolvedCss);

  const [open, setOpen] = useState<Record<string, boolean>>({
    layout: true,
    spacing: true,
    typography: false,
    colors: true,
    borders: false,
    effects: false,
  });

  const toggleSection = useCallback((key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const primaryId = selectedElements[0];
  const component = primaryId ? currentProject?.components[primaryId] : null;

  /* Build resolved CSS for active breakpoint */
  const resolvedCss: CSSProperties = primaryId
    ? (getResolvedCss?.(primaryId, activeBreakpoint) ?? {})
    : {};

  const css = (key: string): string => {
    const val = resolvedCss[key];
    return typeof val === "string"
      ? val
      : typeof val === "number"
        ? String(val)
        : "";
  };

  const set = useCallback(
    (prop: string, val: string) => {
      if (!primaryId) return;
      updateCSSOverride(primaryId, activeBreakpoint, prop, val || undefined);
    },
    [primaryId, activeBreakpoint, updateCSSOverride],
  );

  const resetAll = () => {
    if (!primaryId || !currentProject) return;
    const comp = currentProject.components[primaryId];
    if (!comp) return;
    // Reset by setting the breakpoint overrides to empty
    updateCSSOverride(primaryId, activeBreakpoint, "__reset__", "");
  };

  /* ── No selection state ──────────────────────────────────── */
  if (!primaryId || !component) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-white/15">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-[11px] font-semibold text-white/30">
          Select a layer to style it
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-white">
      {/* ── Header: component ID + breakpoint ────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-white/70">
              {component.type}
            </p>
            <p className="truncate text-[9px] font-mono text-white/25">
              {primaryId}
            </p>
          </div>
          <button
            onClick={resetAll}
            title="Reset styles for this breakpoint"
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-white/20 transition hover:bg-white/[0.06] hover:text-white/50"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
        <BreakpointStrip active={activeBreakpoint} onChange={setBreakpoint} />
      </div>

      {/* ── Layout ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <SectionHeader
          label="Layout"
          open={open.layout}
          onToggle={() => toggleSection("layout")}
        />
        {open.layout && (
          <div className="mt-2 space-y-2">
            <CSSSelect
              label="Display"
              prop="display"
              value={css("display")}
              onChange={set}
              options={[
                "block",
                "flex",
                "grid",
                "inline",
                "inline-block",
                "none",
              ].map((v) => ({ value: v }))}
            />
            <CSSSelect
              label="Position"
              prop="position"
              value={css("position")}
              onChange={set}
              options={[
                "static",
                "relative",
                "absolute",
                "fixed",
                "sticky",
              ].map((v) => ({ value: v }))}
            />
            <CSSSelect
              label="Flex Dir"
              prop="flexDirection"
              value={css("flexDirection")}
              onChange={set}
              options={["row", "column", "row-reverse", "column-reverse"].map(
                (v) => ({ value: v }),
              )}
            />
            <CSSSelect
              label="Justify"
              prop="justifyContent"
              value={css("justifyContent")}
              onChange={set}
              options={[
                { value: "flex-start", label: "start" },
                { value: "center", label: "center" },
                { value: "flex-end", label: "end" },
                { value: "space-between", label: "between" },
                { value: "space-around", label: "around" },
              ]}
            />
            <CSSSelect
              label="Align"
              prop="alignItems"
              value={css("alignItems")}
              onChange={set}
              options={[
                { value: "flex-start", label: "start" },
                { value: "center", label: "center" },
                { value: "flex-end", label: "end" },
                { value: "stretch", label: "stretch" },
              ]}
            />
            <CSSInput
              label="Gap"
              prop="gap"
              value={css("gap")}
              onChange={set}
              placeholder="16px"
            />
            <div className="grid grid-cols-2 gap-2">
              <CSSInput
                label="Width"
                prop="width"
                value={css("width")}
                onChange={set}
                placeholder="auto"
              />
              <CSSInput
                label="Height"
                prop="height"
                value={css("height")}
                onChange={set}
                placeholder="auto"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CSSInput
                label="Max-W"
                prop="maxWidth"
                value={css("maxWidth")}
                onChange={set}
                placeholder="none"
              />
              <CSSInput
                label="Min-H"
                prop="minHeight"
                value={css("minHeight")}
                onChange={set}
                placeholder="0px"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Spacing ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <SectionHeader
          label="Spacing"
          open={open.spacing}
          onToggle={() => toggleSection("spacing")}
        />
        {open.spacing && (
          <div className="mt-2 space-y-3">
            <SpacingQuad
              label="Padding"
              propPrefix="padding"
              values={{
                top: css("paddingTop") || css("padding"),
                right: css("paddingRight") || css("padding"),
                bottom: css("paddingBottom") || css("padding"),
                left: css("paddingLeft") || css("padding"),
              }}
              onChange={set}
            />
            <SpacingQuad
              label="Margin"
              propPrefix="margin"
              values={{
                top: css("marginTop") || css("margin"),
                right: css("marginRight") || css("margin"),
                bottom: css("marginBottom") || css("margin"),
                left: css("marginLeft") || css("margin"),
              }}
              onChange={set}
            />
          </div>
        )}
      </div>

      {/* ── Typography ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <SectionHeader
          label="Typography"
          open={open.typography}
          onToggle={() => toggleSection("typography")}
        />
        {open.typography && (
          <div className="mt-2 space-y-2">
            <CSSInput
              label="Font size"
              prop="fontSize"
              value={css("fontSize")}
              onChange={set}
              placeholder="16px"
            />
            <CSSInput
              label="Line-h"
              prop="lineHeight"
              value={css("lineHeight")}
              onChange={set}
              placeholder="1.5"
            />
            <CSSInput
              label="Letter-S"
              prop="letterSpacing"
              value={css("letterSpacing")}
              onChange={set}
              placeholder="0em"
            />
            <CSSSelect
              label="Weight"
              prop="fontWeight"
              value={css("fontWeight")}
              onChange={set}
              options={["300", "400", "500", "600", "700", "800", "900"].map(
                (v) => ({ value: v }),
              )}
            />
            <CSSSelect
              label="Align"
              prop="textAlign"
              value={css("textAlign")}
              onChange={set}
              options={["left", "center", "right", "justify"].map((v) => ({
                value: v,
              }))}
            />
            <CSSSelect
              label="Transform"
              prop="textTransform"
              value={css("textTransform")}
              onChange={set}
              options={["none", "uppercase", "lowercase", "capitalize"].map(
                (v) => ({ value: v }),
              )}
            />
            <CSSInput
              label="Font family"
              prop="fontFamily"
              value={css("fontFamily")}
              onChange={set}
              placeholder="inherit"
            />
          </div>
        )}
      </div>

      {/* ── Colors ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <SectionHeader
          label="Colors"
          open={open.colors}
          onToggle={() => toggleSection("colors")}
        />
        {open.colors && (
          <div className="mt-2 space-y-2">
            <CSSInput
              label="Color"
              prop="color"
              value={css("color")}
              onChange={set}
              type="color"
            />
            <CSSInput
              label="Background"
              prop="backgroundColor"
              value={css("backgroundColor")}
              onChange={set}
              type="color"
            />
            <CSSInput
              label="BG image"
              prop="backgroundImage"
              value={css("backgroundImage")}
              onChange={set}
              placeholder="url(…)"
            />
            <CSSSelect
              label="BG size"
              prop="backgroundSize"
              value={css("backgroundSize")}
              onChange={set}
              options={["cover", "contain", "auto", "100% 100%"].map((v) => ({
                value: v,
              }))}
            />
            <div className="flex items-center justify-between gap-2">
              <Label>Opacity</Label>
              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={css("opacity") || "1"}
                  onChange={(e) => set("opacity", e.target.value)}
                  className="w-20 accent-violet-500"
                />
                <span className="w-8 text-right text-[10px] font-mono text-white/40">
                  {css("opacity") || "1"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Borders ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <SectionHeader
          label="Borders"
          open={open.borders}
          onToggle={() => toggleSection("borders")}
        />
        {open.borders && (
          <div className="mt-2 space-y-2">
            <CSSInput
              label="Border"
              prop="border"
              value={css("border")}
              onChange={set}
              placeholder="1px solid #000"
            />
            <CSSInput
              label="Radius"
              prop="borderRadius"
              value={css("borderRadius")}
              onChange={set}
              placeholder="0px"
            />
            <CSSInput
              label="Outline"
              prop="outline"
              value={css("outline")}
              onChange={set}
              placeholder="none"
            />
          </div>
        )}
      </div>

      {/* ── Effects ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <SectionHeader
          label="Effects"
          open={open.effects}
          onToggle={() => toggleSection("effects")}
        />
        {open.effects && (
          <div className="mt-2 space-y-2">
            <CSSInput
              label="Box-shadow"
              prop="boxShadow"
              value={css("boxShadow")}
              onChange={set}
              placeholder="0 4px 20px rgba(0,0,0,0.1)"
            />
            <CSSInput
              label="Filter"
              prop="filter"
              value={css("filter")}
              onChange={set}
              placeholder="blur(0px)"
            />
            <CSSInput
              label="Backdrop"
              prop="backdropFilter"
              value={css("backdropFilter")}
              onChange={set}
              placeholder="blur(12px)"
            />
            <CSSInput
              label="Transform"
              prop="transform"
              value={css("transform")}
              onChange={set}
              placeholder="none"
            />
            <CSSSelect
              label="Overflow"
              prop="overflow"
              value={css("overflow")}
              onChange={set}
              options={["visible", "hidden", "scroll", "auto"].map((v) => ({
                value: v,
              }))}
            />
            <CSSInput
              label="Transition"
              prop="transition"
              value={css("transition")}
              onChange={set}
              placeholder="all 0.2s ease"
            />
            <CSSInput
              label="Z-index"
              prop="zIndex"
              value={css("zIndex")}
              onChange={set}
              placeholder="0"
            />
            <CSSInput
              label="Cursor"
              prop="cursor"
              value={css("cursor")}
              onChange={set}
              placeholder="default"
            />
          </div>
        )}
      </div>
    </div>
  );
}
