"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDesignStore } from "@/state/useDesignStore";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useEditorStore } from "@/state/useEditorStore";

/* ----------------------------- helpers ----------------------------- */

type BreakpointKey = "desktop" | "tablet" | "mobile";
const toBucket = (bp: BreakpointKey) => (bp === "desktop" ? "base" : bp);
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

type Stop = { color: string; alpha: number; position: number };
type Gradient = {
  type: "solid" | "linear" | "radial";
  angle?: number;
  stops: Stop[];
};

const DEFAULT_GRADIENT: Gradient = {
  type: "solid",
  angle: 90,
  stops: [{ color: "#ffffff", alpha: 1, position: 0 }],
};

const hexToRgba = (hex = "#000000", a = 1) => {
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((s) => s + s)
      .join("");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const gradientToCss = (g?: Gradient) => {
  if (!g) return undefined;
  const stops = (g.stops || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => `${hexToRgba(s.color, s.alpha)} ${clamp(s.position)}%`);

  if (g.type === "solid") return stops[0]?.split(" ")?.[0] ?? "#ffffff";
  if (g.type === "linear")
    return `linear-gradient(${g.angle ?? 90}deg, ${stops.join(", ")})`;
  return `radial-gradient(circle, ${stops.join(", ")})`;
};

const inputCls =
  "w-full px-3 py-1.5 bg-[#020617] border border-white/10 rounded-md text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors";

const selectCls =
  "w-full px-3 py-1.5 bg-[#020617] border border-white/10 rounded-md text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors appearance-none cursor-pointer";

/* --------------------------- component --------------------------- */

export default function StylePanel() {
  const selectedElements = useDesignStore((s: any) => s.selectedElements);
  const elements = useDesignStore((s: any) => s.elements);
  const updateElement = useDesignStore((s: any) => s.updateElement);

  const { currentProject } = useCanvasStore();
  const { activeBreakpoint } = useEditorStore();

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["layout", "colors"])
  );
  const barRef = useRef<HTMLDivElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const hasSelection = !!selectedElements && selectedElements.length > 0;
  const primaryId = hasSelection ? selectedElements[0] : null;
  const element = primaryId ? elements[primaryId] : null;

  const cssAll = element?.cssProperties || {};
  const bucket = toBucket((activeBreakpoint as BreakpointKey) || "desktop");
  const css = { ...(cssAll.base || {}), ...(cssAll[bucket] || {}) };

  const gradient: Gradient =
    css.backgroundGradient && Array.isArray(css.backgroundGradient.stops)
      ? css.backgroundGradient
      : DEFAULT_GRADIENT;

  const composedBg = css.background || gradientToCss(gradient);

  const getLatestElement = () =>
    (useDesignStore as any).getState().elements[primaryId] || {
      cssProperties: {},
    };

  function writeBucketProp(prop: string, value: any) {
    if (!primaryId) return;
    const latest = getLatestElement();
    const latestCss = latest.cssProperties || {};
    const nextBucket = { ...(latestCss[bucket] || {}) };
    nextBucket[prop] = value;
    updateElement(primaryId, {
      cssProperties: { ...latestCss, [bucket]: nextBucket },
    });
  }

  function updateGradientPartial(partial: Partial<Gradient>) {
    if (!primaryId) return;
    const latest = getLatestElement();
    const latestCss = latest.cssProperties || {};
    const bucketObj = { ...(latestCss[bucket] || {}) };

    const existing =
      bucketObj.backgroundGradient &&
      Array.isArray(bucketObj.backgroundGradient.stops)
        ? bucketObj.backgroundGradient
        : gradient || DEFAULT_GRADIENT;

    const next: Gradient = {
      ...existing,
      ...partial,
      stops: partial.stops ?? existing.stops,
    };

    bucketObj.backgroundGradient = next;
    bucketObj.background = gradientToCss(next);
    updateElement(primaryId, {
      cssProperties: { ...latestCss, [bucket]: bucketObj },
    });
  }

  useEffect(() => {
    if (dragIndex === null) return;

    const move = (ev: MouseEvent | TouchEvent) => {
      const rect = barRef.current?.getBoundingClientRect();
      if (!rect || !primaryId) return;
      const clientX =
        ev instanceof TouchEvent
          ? ev.touches[0]?.clientX ?? 0
          : (ev as MouseEvent).clientX;
      const pos = clamp(Math.round(((clientX - rect.left) / rect.width) * 100));

      const latest = getLatestElement();
      const latestCss = latest.cssProperties || {};
      const bucketObj = { ...(latestCss[bucket] || {}) };

      const existing =
        bucketObj.backgroundGradient &&
        Array.isArray(bucketObj.backgroundGradient.stops)
          ? bucketObj.backgroundGradient
          : gradient;

      const stops = (existing.stops || []).slice();
      stops[dragIndex] = { ...stops[dragIndex], position: pos };

      bucketObj.backgroundGradient = { ...existing, stops };
      bucketObj.background = gradientToCss(bucketObj.backgroundGradient);

      updateElement(primaryId, {
        cssProperties: { ...latestCss, [bucket]: bucketObj },
      });
    };

    const up = () => {
      setDragIndex(null);
      window.removeEventListener("mousemove", move as any);
      window.removeEventListener("mouseup", up as any);
      window.removeEventListener("touchmove", move as any);
      window.removeEventListener("touchend", up as any);
    };

    window.addEventListener("mousemove", move as any);
    window.addEventListener("mouseup", up as any);
    window.addEventListener("touchmove", move as any);
    window.addEventListener("touchend", up as any);

    return up;
  }, [dragIndex]);

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const open = expanded.has(id);
    return (
      <div className="rounded-lg border border-white/5 bg-white/2 overflow-hidden">
        <button
          onClick={() =>
            setExpanded((s) => {
              const n = new Set(s);
              open ? n.delete(id) : n.add(id);
              return n;
            })
          }
          className="w-full px-3 py-2 flex justify-between items-center text-xs text-gray-300 hover:text-gray-100 hover:bg-white/5 transition-colors group"
        >
          <span className="font-medium">{title}</span>
          <ChevronDown
            size={14}
            className={`text-gray-400 group-hover:text-gray-300 transition-all duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && (
          <div className="px-3 py-2.5 space-y-2 border-t border-white/5 bg-white/1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const getElementInfo = (id: string) =>
    currentProject?.components?.[id]?.type || "Unknown";

  function addStop() {
    const stops = (gradient.stops || []).slice();
    const pos = stops.length
      ? clamp(Math.round(stops[stops.length - 1].position + 10), 0, 100)
      : 50;
    stops.push({ color: "#000000", alpha: 1, position: pos });
    updateGradientPartial({ stops });
  }

  function removeStop(idx: number) {
    const stops = (gradient.stops || []).slice();
    if (stops.length <= 1) return;
    stops.splice(idx, 1);
    updateGradientPartial({ stops });
  }

  function setStopColor(idx: number, color: string) {
    const stops = (gradient.stops || []).slice();
    stops[idx] = { ...stops[idx], color };
    updateGradientPartial({ stops });
  }

  function setStopAlpha(idx: number, alpha: number) {
    const stops = (gradient.stops || []).slice();
    stops[idx] = { ...stops[idx], alpha: Math.max(0, Math.min(1, alpha)) };
    updateGradientPartial({ stops });
  }

  function setStopPosition(idx: number, pos: number) {
    const stops = (gradient.stops || []).slice();
    stops[idx] = { ...stops[idx], position: clamp(Math.round(pos), 0, 100) };
    updateGradientPartial({ stops });
  }

  function setAngle(a: number) {
    updateGradientPartial({ angle: clamp(a, 0, 360) });
  }

  const stopsSorted = (gradient.stops || [])
    .slice()
    .sort((a, b) => a.position - b.position);

  const PRESET_COLORS = [
    "#ffffff",
    "#000000",
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#9B5DE5",
  ];

  return (
    <div className="flex flex-col h-full bg-[linear-gradient(180deg,#020617_0%,#020617_100%)] text-gray-100">
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 border-b border-white/5 bg-white/3 backdrop-blur-sm">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Styles
          <span className="ml-2 inline-block px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-mono text-[9px]">
            {activeBreakpoint}
          </span>
        </p>
        <p className="text-xs font-medium text-gray-100 mt-1">
          {primaryId ? getElementInfo(primaryId) : "No element selected"}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!hasSelection ? (
          <div className="flex items-center justify-center h-full">
            <div className="p-4 rounded-lg border border-white/5 bg-white/2">
              <p className="text-xs text-gray-400 text-center">
                Select an element on the canvas to edit styles
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Layout */}
            <Section id="layout" title="Layout">
              <select
                className={selectCls}
                value={css.display || "block"}
                onChange={(e) => writeBucketProp("display", e.target.value)}
              >
                <option value="block">Block</option>
                <option value="inline">Inline</option>
                <option value="inline-block">Inline Block</option>
                <option value="flex">Flex</option>
                <option value="grid">Grid</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputCls}
                  placeholder="Width (px, %)"
                  value={css.width || ""}
                  onChange={(e) => writeBucketProp("width", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Height (px, auto)"
                  value={css.height || ""}
                  onChange={(e) => writeBucketProp("height", e.target.value)}
                />
              </div>

              {css.display === "flex" && (
                <div className="space-y-2 pt-2 border-t border-white/5 mt-2">
                  <select
                    className={selectCls}
                    value={css.flexDirection || "row"}
                    onChange={(e) =>
                      writeBucketProp("flexDirection", e.target.value)
                    }
                  >
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                  <select
                    className={selectCls}
                    value={css.justifyContent || "flex-start"}
                    onChange={(e) =>
                      writeBucketProp("justifyContent", e.target.value)
                    }
                  >
                    <option value="flex-start">justify-start</option>
                    <option value="center">center</option>
                    <option value="flex-end">justify-end</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                  <select
                    className={selectCls}
                    value={css.alignItems || "stretch"}
                    onChange={(e) =>
                      writeBucketProp("alignItems", e.target.value)
                    }
                  >
                    <option value="stretch">stretch</option>
                    <option value="flex-start">flex-start</option>
                    <option value="center">center</option>
                    <option value="flex-end">flex-end</option>
                  </select>
                  <input
                    className={inputCls}
                    placeholder="Gap (px)"
                    value={css.gap || ""}
                    onChange={(e) => writeBucketProp("gap", e.target.value)}
                  />
                </div>
              )}
            </Section>

            {/* Spacing */}
            <Section id="spacing" title="Spacing">
              <input
                className={inputCls}
                placeholder="Padding (e.g. 12px 16px)"
                value={css.padding || ""}
                onChange={(e) => writeBucketProp("padding", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Margin (e.g. 0 auto)"
                value={css.margin || ""}
                onChange={(e) => writeBucketProp("margin", e.target.value)}
              />
            </Section>

            {/* Colors & Gradient */}
            <Section id="colors" title="Colors & Gradient">
              <div className="flex gap-2 items-center">
                <select
                  className={selectCls}
                  value={gradient.type}
                  onChange={(e) =>
                    updateGradientPartial({ type: e.target.value as any })
                  }
                >
                  <option value="solid">Solid</option>
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>

                {gradient.type === "linear" && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={gradient.angle ?? 90}
                      onChange={(e) => setAngle(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer accent-blue-500"
                    />
                    <input
                      className="w-14 px-2 py-1.5 bg-[#020617] border border-white/10 rounded-md text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                      type="number"
                      min={0}
                      max={360}
                      value={gradient.angle ?? 90}
                      onChange={(e) => setAngle(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              {/* Gradient preview bar */}
              <div
                ref={barRef}
                style={{ background: composedBg }}
                className="relative h-10 rounded-md border border-white/10 cursor-crosshair hover:border-white/20 transition-colors overflow-hidden"
                onMouseDown={(ev) => {
                  const rect = barRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const pos = clamp(
                    Math.round(((ev.clientX - rect.left) / rect.width) * 100),
                    0,
                    100
                  );
                  const nextStops = (gradient.stops || []).slice();
                  nextStops.push({
                    color: nextStops[0]?.color ?? "#000000",
                    alpha: 1,
                    position: pos,
                  });
                  updateGradientPartial({ stops: nextStops });
                }}
              >
                {stopsSorted.map((s, i) => {
                  const origIndex = (gradient.stops || []).findIndex(
                    (x) =>
                      x.position === s.position &&
                      x.color === s.color &&
                      x.alpha === s.alpha
                  );
                  const idx = origIndex >= 0 ? origIndex : i;
                  return (
                    <div
                      key={`${s.color}-${s.position}-${idx}`}
                      style={{
                        left: `${clamp(s.position)}%`,
                        position: "absolute",
                        transform: "translate(-50%,-50%)",
                        top: "50%",
                      }}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDragIndex(idx);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setDragIndex(idx);
                        }}
                        className="w-4 h-4 rounded-full border border-white/40 shadow-lg hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
                        style={{ background: hexToRgba(s.color, s.alpha) }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Stops controls */}
              <div className="space-y-2">
                {stopsSorted.map((s, shownIndex) => {
                  const origIndex = (gradient.stops || []).findIndex(
                    (x) =>
                      x.position === s.position &&
                      x.color === s.color &&
                      x.alpha === s.alpha
                  );
                  const idx = origIndex >= 0 ? origIndex : shownIndex;
                  return (
                    <div
                      key={`${idx}-${s.color}`}
                      className="flex items-center gap-2 p-2 rounded-md bg-white/2 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <input
                        type="color"
                        value={s.color}
                        onChange={(e) => setStopColor(idx, e.target.value)}
                        className="w-8 h-8 rounded-md border border-white/10 cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          className="w-12 px-2 py-1 bg-[#020617] border border-white/10 rounded text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                          type="number"
                          min={0}
                          max={100}
                          value={s.position}
                          onChange={(e) =>
                            setStopPosition(idx, Number(e.target.value))
                          }
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                      <input
                        className="w-12 px-2 py-1 bg-[#020617] border border-white/10 rounded text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={s.alpha}
                        onChange={(e) =>
                          setStopAlpha(idx, Number(e.target.value))
                        }
                      />
                      <button
                        onClick={() => removeStop(idx)}
                        disabled={(gradient.stops || []).length <= 1}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    onClick={() => addStop()}
                    className="text-xs font-medium px-2 py-1 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                  >
                    + Add stop
                  </button>
                  <button
                    onClick={() =>
                      updateGradientPartial({
                        stops: [{ color: "#ffffff", alpha: 1, position: 0 }],
                        type: "solid",
                        angle: 90,
                      })
                    }
                    className="text-xs font-medium px-2 py-1 rounded-md text-gray-400 hover:text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex gap-1 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        const stops = (gradient.stops || []).slice();
                        if (!stops.length)
                          stops.push({ color: c, alpha: 1, position: 0 });
                        else stops[0] = { ...stops[0], color: c };
                        updateGradientPartial({ stops });
                      }}
                      title={c}
                      className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 hover:border-white/20 transition-all shadow-sm cursor-pointer"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Text color */}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <input
                  type="color"
                  className="w-8 h-8 rounded-md border border-white/10 cursor-pointer"
                  value={css.color || "#000000"}
                  onChange={(e) => writeBucketProp("color", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Text color (hex)"
                  value={css.color || ""}
                  onChange={(e) => writeBucketProp("color", e.target.value)}
                />
              </div>
            </Section>

            {/* Typography */}
            <Section id="typography" title="Typography">
              <input
                className={inputCls}
                placeholder="Font size (px)"
                value={css.fontSize || ""}
                onChange={(e) => writeBucketProp("fontSize", e.target.value)}
              />
              <select
                className={selectCls}
                value={css.fontWeight || "400"}
                onChange={(e) => writeBucketProp("fontWeight", e.target.value)}
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
              <input
                className={inputCls}
                placeholder="Line height (e.g. 1.5)"
                value={css.lineHeight || ""}
                onChange={(e) => writeBucketProp("lineHeight", e.target.value)}
              />
              <select
                className={selectCls}
                value={css.textAlign || "left"}
                onChange={(e) => writeBucketProp("textAlign", e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </Section>

            {/* Effects */}
            <Section id="effects" title="Effects">
              <input
                className={inputCls}
                placeholder="Border radius (px)"
                value={css.borderRadius || ""}
                onChange={(e) =>
                  writeBucketProp("borderRadius", e.target.value)
                }
              />
              <input
                className={inputCls}
                placeholder="Box shadow"
                value={css.boxShadow || ""}
                onChange={(e) => writeBucketProp("boxShadow", e.target.value)}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={typeof css.opacity === "number" ? css.opacity : 1}
                    onChange={(e) =>
                      writeBucketProp("opacity", Number(e.target.value))
                    }
                    className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer accent-blue-500"
                  />
                  <span className="text-xs font-medium text-gray-400 min-w-[40px]">
                    {Math.round(
                      (typeof css.opacity === "number" ? css.opacity : 1) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputCls}
                  placeholder="Border width (px)"
                  value={css.borderWidth || ""}
                  onChange={(e) =>
                    writeBucketProp("borderWidth", e.target.value)
                  }
                />
                <input
                  className={inputCls}
                  placeholder="Border color (hex)"
                  value={css.borderColor || ""}
                  onChange={(e) =>
                    writeBucketProp("borderColor", e.target.value)
                  }
                />
              </div>
            </Section>

            {/* Position */}
            <Section id="position" title="Position">
              <select
                className={selectCls}
                value={css.position || "static"}
                onChange={(e) => writeBucketProp("position", e.target.value)}
              >
                <option value="static">Static</option>
                <option value="relative">Relative</option>
                <option value="absolute">Absolute</option>
                <option value="fixed">Fixed</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputCls}
                  placeholder="Top (px)"
                  value={css.top || ""}
                  onChange={(e) => writeBucketProp("top", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Left (px)"
                  value={css.left || ""}
                  onChange={(e) => writeBucketProp("left", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Right (px)"
                  value={css.right || ""}
                  onChange={(e) => writeBucketProp("right", e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Bottom (px)"
                  value={css.bottom || ""}
                  onChange={(e) => writeBucketProp("bottom", e.target.value)}
                />
              </div>

              <input
                className={inputCls}
                placeholder="z-index"
                value={css.zIndex || ""}
                onChange={(e) => writeBucketProp("zIndex", e.target.value)}
              />
              <select
                className={selectCls}
                value={css.overflow || "visible"}
                onChange={(e) => writeBucketProp("overflow", e.target.value)}
              >
                <option value="visible">visible</option>
                <option value="hidden">hidden</option>
                <option value="scroll">scroll</option>
                <option value="auto">auto</option>
              </select>
            </Section>

            {/* Advanced */}
            <Section id="layout-advanced" title="Layout — Advanced">
              <input
                className={inputCls}
                placeholder="min-width (px, %)"
                value={css.minWidth || ""}
                onChange={(e) => writeBucketProp("minWidth", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="max-width (px, %)"
                value={css.maxWidth || ""}
                onChange={(e) => writeBucketProp("maxWidth", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="min-height (px)"
                value={css.minHeight || ""}
                onChange={(e) => writeBucketProp("minHeight", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="max-height (px)"
                value={css.maxHeight || ""}
                onChange={(e) => writeBucketProp("maxHeight", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="order (flex)"
                value={css.order || ""}
                onChange={(e) => writeBucketProp("order", e.target.value)}
              />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
