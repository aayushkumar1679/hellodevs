// src/app/components/canvas/CanvasElement.tsx
"use client";

import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useDesignStore } from "@/state/useDesignStore";

export interface CanvasElementProps {
  elementId: string;
  children?: React.ReactNode;
  className?: string;
  onRect?: (rect: DOMRect) => void;
  /** optional: returns snap targets in client coordinates (xs, ys) */
  getSnapTargets?: () => { xs: number[]; ys: number[] } | null;
  /** optional: called with guide lines (client coords) while resizing/moving */
  onGuide?: (guides: Array<{ x?: number; y?: number }>) => void;
  /** The HTML tag to render as (e.g. 'section', 'nav', 'div') */
  as?: keyof React.JSX.IntrinsicElements;
}

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/* ---------------------------------------------
  Helpers / constants
---------------------------------------------- */

const GRID = 8;
const SNAP_THRESHOLD = 8; 

const snapToGrid = (v: number) => Math.round(v / GRID) * GRID;

function resolveBackground(css: Record<string, unknown>) {
  if (css.background) return css.background;

  if (
    css.backgroundGradient &&
    typeof css.backgroundGradient === "object" &&
    !Array.isArray(css.backgroundGradient)
  ) {
    const g = css.backgroundGradient;
    if ("type" in g && "colors" in g && Array.isArray(g.colors)) {
      if (g.type === "solid") return g.colors[0];
      if (g.type === "linear") {
        const angle = "angle" in g ? g.angle : 90;
        return `linear-gradient(${angle ?? 90}deg, ${g.colors.join(", ")})`;
      }
      if (g.type === "radial") {
        return `radial-gradient(circle, ${g.colors.join(", ")})`;
      }
    }
  }

  return css.backgroundColor;
}

function findClosest(targets: number[] | undefined, value: number) {
  if (!targets || targets.length === 0)
    return { best: null as number | null, dist: Infinity };
  let best: number | null = null;
  let dist = Infinity;
  for (const t of targets) {
    const d = Math.abs(t - value);
    if (d < dist) {
      dist = d;
      best = t;
    }
  }
  return { best, dist };
}

/* =============================================
  CanvasElement
============================================= */

export default function CanvasElement({
  elementId,
  children,
  className = "",
  onRect,
  getSnapTargets,
  onGuide,
  as,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const element = useDesignStore((s) => s.elements[elementId]);
  const selectedElements = useDesignStore((s) => s.selectedElements);
  const selectElement = useDesignStore((s) => s.selectElement);
  const updateCSSProperty = useDesignStore((s) => s.updateCSSProperty);
  const getResolvedCss = useDesignStore((s) => s.getResolvedCss);

  const [isResizing, setIsResizing] = useState(false);

  const isSelected = selectedElements.includes(elementId);
  const css = useMemo(
    () => (element ? getResolvedCss(elementId) : ({} as Record<string, unknown>)),
    [element, elementId, getResolvedCss]
  );

  useLayoutEffect(() => {
    if (!elementRef.current || !onRect) return;
    onRect(elementRef.current.getBoundingClientRect());
  }, [elementId, onRect]);

  useEffect(() => {
    if (!elementRef.current || !onRect) return;
    const id = window.setTimeout(() => {
      onRect(elementRef.current!.getBoundingClientRect());
    }, 0);
    return () => window.clearTimeout(id);
  }, [css?.width, css?.height, css?.left, css?.top, onRect]);

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startLeft: number;
    startTop: number;
    dir: ResizeDir;
    aspect?: number;
    canvasRectLeft?: number;
  } | null>(null);

  const onResizeMove = useCallback((ev: MouseEvent) => {
    ev.preventDefault();
    const state = resizeRef.current;
    if (!state || !elementRef.current) return;

    const { startX, startY, startW, startH, startLeft, startTop, dir, aspect } = state;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    const shiftLock = (ev as MouseEvent & { shiftKey?: boolean }).shiftKey ?? false;
    const altCenter = (ev as MouseEvent & { altKey?: boolean }).altKey ?? false;

    let newW = startW;
    let newH = startH;
    let newLeft = startLeft;
    let newTop = startTop;

    if (dir.includes("e")) {
      newW = startW + dx;
      if (altCenter) newLeft = startLeft - dx / 2;
    }
    if (dir.includes("w")) {
      newW = startW - dx;
      if (altCenter) {
        newLeft = startLeft - dx / 2;
      } else {
        newLeft = startLeft + dx;
      }
    }
    if (dir.includes("s")) {
      newH = startH + dy;
      if (altCenter) newTop = startTop - dy / 2;
    }
    if (dir.includes("n")) {
      newH = startH - dy;
      if (altCenter) {
        newTop = startTop - dy / 2;
      } else {
        newTop = startTop + dy;
      }
    }

    newW = Math.max(10, newW);
    newH = Math.max(10, newH);

    if (shiftLock && aspect && aspect > 0) {
      if (Math.abs(newW - startW) >= Math.abs(newH - startH)) {
        newH = Math.max(10, newW / aspect);
        if (dir.includes("n") && !altCenter) newTop = startTop + (startH - newH);
      } else {
        newW = Math.max(10, newH * aspect);
        if (dir.includes("w") && !altCenter) newLeft = startLeft + (startW - newW);
      }
    }

    let snappedLeft = snapToGrid(newLeft);
    let snappedTop = snapToGrid(newTop);
    let snappedW = snapToGrid(newW);
    let snappedH = snapToGrid(newH);

    const snapTargets = getSnapTargets ? getSnapTargets() : null;
    const guidesToEmit: Array<{ x?: number; y?: number }> = [];

    if (snapTargets) {
      const { best: bestLeft, dist: distLeft } = findClosest(
        snapTargets.xs,
        Math.round(snappedLeft)
      );
      const { best: bestRight, dist: distRight } = findClosest(
        snapTargets.xs,
        Math.round(snappedLeft + snappedW)
      );
      const { best: bestCenterX, dist: distCenterX } = findClosest(
        snapTargets.xs,
        Math.round(snappedLeft + snappedW / 2)
      );

      if (bestLeft !== null && distLeft <= SNAP_THRESHOLD) {
        snappedLeft = bestLeft;
        snappedW = Math.max(10, Math.round(snappedLeft + snappedW - snappedLeft));
        guidesToEmit.push({ x: bestLeft });
      } else if (bestRight !== null && distRight <= SNAP_THRESHOLD) {
        snappedLeft = bestRight - snappedW;
        guidesToEmit.push({ x: bestRight });
      } else if (bestCenterX !== null && distCenterX <= SNAP_THRESHOLD) {
        snappedLeft = bestCenterX - Math.round(snappedW / 2);
        guidesToEmit.push({ x: bestCenterX });
      }

      const { best: bestTop, dist: distTop } = findClosest(
        snapTargets.ys,
        Math.round(snappedTop)
      );
      const { best: bestBottom, dist: distBottom } = findClosest(
        snapTargets.ys,
        Math.round(snappedTop + snappedH)
      );
      const { best: bestCenterY, dist: distCenterY } = findClosest(
        snapTargets.ys,
        Math.round(snappedTop + snappedH / 2)
      );

      if (bestTop !== null && distTop <= SNAP_THRESHOLD) {
        snappedTop = bestTop;
        snappedH = Math.max(10, Math.round(snappedTop + snappedH - snappedTop));
        guidesToEmit.push({ y: bestTop });
      } else if (bestBottom !== null && distBottom <= SNAP_THRESHOLD) {
        snappedTop = bestBottom - snappedH;
        guidesToEmit.push({ y: bestBottom });
      } else if (bestCenterY !== null && distCenterY <= SNAP_THRESHOLD) {
        snappedTop = bestCenterY - Math.round(snappedH / 2);
        guidesToEmit.push({ y: bestCenterY });
      }
    }

    if (onGuide) onGuide(guidesToEmit);

    updateCSSProperty(elementId, "width", `${Math.round(snappedW)}px`);
    updateCSSProperty(elementId, "height", `${Math.round(snappedH)}px`);
    if (dir.includes("w") || dir.includes("n") || altCenter) {
      updateCSSProperty(elementId, "position", "absolute");
      updateCSSProperty(elementId, "left", `${Math.round(snappedLeft)}px`);
      updateCSSProperty(elementId, "top", `${Math.round(snappedTop)}px`);
    }

    if (onRect) {
      onRect(new DOMRect(snappedLeft, snappedTop, snappedW, snappedH));
    }
  }, [elementId, getSnapTargets, onGuide, onRect, updateCSSProperty]);

  const stopResize = useCallback(function handleStopResize() {
    const el = elementRef.current;
    if (el) el.removeAttribute("data-resizing");
    setIsResizing(false);
    resizeRef.current = null;
    if (onGuide) onGuide([]);
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", handleStopResize);
  }, [onGuide, onResizeMove]);

  const startResize = useCallback((e: React.MouseEvent, dir: ResizeDir) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const el = elementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const numericLeft = css && css.left ? parseFloat(String(css.left)) || rect.left : rect.left;
    const numericTop = css && css.top ? parseFloat(String(css.top)) || rect.top : rect.top;

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      startLeft: numericLeft,
      startTop: numericTop,
      dir,
      aspect: rect.width / Math.max(1, rect.height),
    };

    el.setAttribute("data-resizing", "true");
    setIsResizing(true);
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", stopResize);
  }, [css, onResizeMove, stopResize]);

  const inlineStyle = useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {
      transition: isResizing
        ? "none"
        : "box-shadow 120ms ease, outline 120ms ease, transform 120ms ease",
      boxSizing: "border-box",
    };

    if (!css) return style;

    Object.entries(css).forEach(([key, val]) => {
      if (key === "background" || key === "backgroundColor" || key === "backgroundGradient") return;
      const styleRecord = style as Record<string, unknown>;
      styleRecord[key] = val;
    });

    const bg = resolveBackground(css);
    if (bg) style.background = bg;

    if (css.zIndex !== undefined) {
      style.zIndex = typeof css.zIndex === "number" ? css.zIndex : Number(css.zIndex) || undefined;
    }

    if (isResizing) {
      style.willChange = "width, height, left, top";
    }

    return style;
  }, [css, isResizing]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectElement(elementId, e.ctrlKey || e.metaKey);
    },
    [selectElement, elementId]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onResizeMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [onResizeMove, stopResize]);

  const Component = (as || "div") as React.ElementType;

  return (
    <Component
      ref={elementRef}
      onClick={handleClick}
      style={inlineStyle}
      data-resizing={isResizing ? "true" : "false"}
      data-element-id={elementId}
      className={`relative transition-shadow duration-150 will-change-transform ${
        isSelected
          ? "outline outline-2 outline-sky-500 outline-offset-2 shadow-[0_22px_44px_-28px_rgba(14,165,233,0.55)]"
          : "hover:outline hover:outline-1 hover:outline-slate-300 hover:shadow-[0_20px_40px_-32px_rgba(15,23,42,0.3)]"
      } ${className}`}
    >
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {(
            [
              ["nw", "top-0 left-0 cursor-nw-resize"],
              ["n", "top-0 left-1/2 -translate-x-1/2 cursor-n-resize"],
              ["ne", "top-0 right-0 cursor-ne-resize"],
              ["e", "top-1/2 right-0 -translate-y-1/2 cursor-e-resize"],
              ["se", "bottom-0 right-0 cursor-se-resize"],
              ["s", "bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize"],
              ["sw", "bottom-0 left-0 cursor-sw-resize"],
              ["w", "top-1/2 left-0 -translate-y-1/2 cursor-w-resize"],
            ] as [ResizeDir, string][]
          ).map(([dir, cls]) => (
            <div
              key={dir}
              data-resize-handle="true"
              onMouseDown={(e) => startResize(e, dir)}
              className={`absolute h-3.5 w-3.5 rounded-sm border border-sky-500 bg-white pointer-events-auto transform transition-transform duration-100 hover:scale-110 ${cls}`}
            />
          ))}
        </div>
      )}
      {children}
    </Component>
  );
}
