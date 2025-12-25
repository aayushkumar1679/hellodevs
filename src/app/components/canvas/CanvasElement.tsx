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

/* ---------------------------------------------
  Types
---------------------------------------------- */

interface CanvasElementProps {
  elementId: string;
  children?: React.ReactNode;
  className?: string;
  onRect?: (rect: DOMRect) => void;
  /** optional: returns snap targets in client coordinates (xs, ys) */
  getSnapTargets?: () => { xs: number[]; ys: number[] } | null;
  /** optional: called with guide lines (client coords) while resizing/moving */
  onGuide?: (guides: Array<{ x?: number; y?: number }>) => void;
}

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/* ---------------------------------------------
  Helpers / constants
---------------------------------------------- */

const GRID = 8;
const SNAP_THRESHOLD = 8; // px for snapping to other edges/centers

const snapToGrid = (v: number) => Math.round(v / GRID) * GRID;

function resolveBackground(css: Record<string, any>) {
  if (css.background) return css.background;

  if (css.backgroundGradient) {
    const g = css.backgroundGradient;
    if (g.type === "solid") return g.colors?.[0];
    if (g.type === "linear")
      return `linear-gradient(${g.angle ?? 90}deg, ${g.colors.join(", ")})`;
    if (g.type === "radial")
      return `radial-gradient(circle, ${g.colors.join(", ")})`;
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
}: CanvasElementProps) {
  /* ---------------- Hooks (ORDER SAFE) ---------------- */

  const elementRef = useRef<HTMLDivElement | null>(null);

  // store functions from design store (keeps same patterns as your code)
  const element = useDesignStore((s) => s.elements[elementId]);
  const selectedElements = useDesignStore((s) => s.selectedElements);
  const selectElement = useDesignStore((s) => s.selectElement);
  const updateCSSProperty = useDesignStore((s) => s.updateCSSProperty);
  const getResolvedCss = useDesignStore((s) => s.getResolvedCss);

  const [isResizing, setIsResizing] = useState(false);

  /* ---------------- Derived ---------------- */

  const isSelected = selectedElements.includes(elementId);
  const css = element ? getResolvedCss(elementId) : {};

  /* ---------------- Measure rect ---------------- */

  // report rect on layout and when size changes
  useLayoutEffect(() => {
    if (!elementRef.current || !onRect) return;
    onRect(elementRef.current.getBoundingClientRect());
    // elementId inclusion ensures if element changes we re-run
  }, [elementId, onRect]);

  // also report rect after any css change (useEffect watching element)
  useEffect(() => {
    if (!elementRef.current || !onRect) return;
    const id = window.setTimeout(() => {
      onRect(elementRef.current!.getBoundingClientRect());
    }, 0);
    return () => window.clearTimeout(id);
  }, [css?.width, css?.height, css?.left, css?.top, onRect]);

  /* ---------------- Resize state ---------------- */

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

  /* ---------------- Resize handlers (with snapping, center, aspect) ---------------- */

  const startResize = (e: React.MouseEvent, dir: ResizeDir) => {
    // only left button
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const el = elementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // numeric left/top: prefer explicit css left/top (px) if provided,
    // otherwise fallback to client rect.left/top (page coordinates).
    const numericLeft =
      css && css.left ? parseFloat(String(css.left)) || rect.left : rect.left;
    const numericTop =
      css && css.top ? parseFloat(String(css.top)) || rect.top : rect.top;

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

    // attach global listeners
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", stopResize);
  };

  const onResizeMove = (ev: MouseEvent) => {
    ev.preventDefault();

    const state = resizeRef.current;
    if (!state || !elementRef.current) return;

    const { startX, startY, startW, startH, startLeft, startTop, dir, aspect } =
      state;

    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    // supporting dynamic modifiers: Shift (aspect lock), Alt (center)
    const shiftLock =
      (ev as MouseEvent & { shiftKey?: boolean }).shiftKey ?? false;
    const altCenter = (ev as MouseEvent & { altKey?: boolean }).altKey ?? false;

    let newW = startW;
    let newH = startH;
    let newLeft = startLeft;
    let newTop = startTop;

    // width adjustments
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

    // height adjustments
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

    // enforce minimum
    newW = Math.max(10, newW);
    newH = Math.max(10, newH);

    // aspect lock (Shift): choose primary axis adaptively
    if (shiftLock && aspect && aspect > 0) {
      const deltaW = Math.abs(newW - startW);
      const deltaH = Math.abs(newH - startH);

      if (deltaW >= deltaH) {
        newH = Math.max(10, newW / aspect);
        if (dir.includes("n") && !altCenter) {
          newTop = startTop + (startH - newH);
        }
      } else {
        newW = Math.max(10, newH * aspect);
        if (dir.includes("w") && !altCenter) {
          newLeft = startLeft + (startW - newW);
        }
      }
    }

    // ---- snapping to grid ----
    let snappedLeft = snapToGrid(newLeft);
    let snappedTop = snapToGrid(newTop);
    let snappedW = snapToGrid(newW);
    let snappedH = snapToGrid(newH);

    // ---- snapping to other elements (edge + center) ----
    const snapTargets = getSnapTargets ? getSnapTargets() : null;
    const guidesToEmit: Array<{ x?: number; y?: number }> = [];

    if (snapTargets) {
      const candidateClientLeft = snappedLeft;
      const candidateClientTop = snappedTop;
      const candidateClientRight = candidateClientLeft + snappedW;
      const candidateClientBottom = candidateClientTop + snappedH;
      const candidateCenterX = Math.round(candidateClientLeft + snappedW / 2);
      const candidateCenterY = Math.round(candidateClientTop + snappedH / 2);

      // X axis snapping
      const { best: bestLeft, dist: distLeft } = findClosest(
        snapTargets.xs,
        Math.round(candidateClientLeft)
      );
      const { best: bestRight, dist: distRight } = findClosest(
        snapTargets.xs,
        Math.round(candidateClientRight)
      );
      const { best: bestCenterX, dist: distCenterX } = findClosest(
        snapTargets.xs,
        candidateCenterX
      );

      if (bestLeft !== null && distLeft <= SNAP_THRESHOLD) {
        snappedLeft = bestLeft;
        snappedW = Math.max(10, Math.round(candidateClientRight - snappedLeft));
        guidesToEmit.push({ x: bestLeft });
      } else if (bestRight !== null && distRight <= SNAP_THRESHOLD) {
        const leftCandidate = bestRight - snappedW;
        snappedLeft = leftCandidate;
        guidesToEmit.push({ x: bestRight });
      } else if (bestCenterX !== null && distCenterX <= SNAP_THRESHOLD) {
        const leftCandidate = bestCenterX - Math.round(snappedW / 2);
        snappedLeft = leftCandidate;
        guidesToEmit.push({ x: bestCenterX });
      }

      // Y axis snapping
      const { best: bestTop, dist: distTop } = findClosest(
        snapTargets.ys,
        Math.round(candidateClientTop)
      );
      const { best: bestBottom, dist: distBottom } = findClosest(
        snapTargets.ys,
        Math.round(candidateClientBottom)
      );
      const { best: bestCenterY, dist: distCenterY } = findClosest(
        snapTargets.ys,
        candidateCenterY
      );

      if (bestTop !== null && distTop <= SNAP_THRESHOLD) {
        snappedTop = bestTop;
        snappedH = Math.max(10, Math.round(candidateClientBottom - snappedTop));
        guidesToEmit.push({ y: bestTop });
      } else if (bestBottom !== null && distBottom <= SNAP_THRESHOLD) {
        const topCandidate = bestBottom - snappedH;
        snappedTop = topCandidate;
        guidesToEmit.push({ y: bestBottom });
      } else if (bestCenterY !== null && distCenterY <= SNAP_THRESHOLD) {
        const topCandidate = bestCenterY - Math.round(snappedH / 2);
        snappedTop = topCandidate;
        guidesToEmit.push({ y: bestCenterY });
      }
    }

    // Emit guides (client coords) so Canvas may draw them (optional)
    if (onGuide) {
      onGuide(guidesToEmit);
    }

    // ---- autosize (content-based height) ----
    let finalHeightValue = snappedH;
    if (css && (css.height === "auto" || css.autoHeight === true)) {
      // set width first to allow content to wrap correctly, then measure
      updateCSSProperty(elementId, "width", `${snappedW}px`);
      requestAnimationFrame(() => {
        const el = elementRef.current;
        if (!el) return;
        const measured = el.scrollHeight || Math.round(snappedH);
        const measuredSnapped = snapToGrid(Math.max(10, measured));
        updateCSSProperty(elementId, "height", `${measuredSnapped}px`);
        if (
          dir.includes("w") ||
          dir.includes("n") ||
          (ev as MouseEvent & { altKey?: boolean }).altKey
        ) {
          updateCSSProperty(elementId, "position", "absolute");
          updateCSSProperty(elementId, "left", `${Math.round(snappedLeft)}px`);
          updateCSSProperty(elementId, "top", `${Math.round(snappedTop)}px`);
        }
        if (onRect && elementRef.current) {
          onRect(elementRef.current.getBoundingClientRect());
        }
      });
      return;
    }

    // ---- apply the snapped values to store ----
    updateCSSProperty(elementId, "width", `${Math.round(snappedW)}px`);
    updateCSSProperty(elementId, "height", `${Math.round(snappedH)}px`);

    if (
      dir.includes("w") ||
      dir.includes("n") ||
      (ev as MouseEvent & { altKey?: boolean }).altKey
    ) {
      updateCSSProperty(elementId, "position", "absolute");
      updateCSSProperty(elementId, "left", `${Math.round(snappedLeft)}px`);
      updateCSSProperty(elementId, "top", `${Math.round(snappedTop)}px`);
    }

    // update measured rect for live snapping consumers
    if (onRect) {
      const expectedRect = new DOMRect(
        Math.round(snappedLeft),
        Math.round(snappedTop),
        Math.round(snappedW),
        Math.round(snappedH)
      );
      onRect(expectedRect);
    }
  };

  const stopResize = () => {
    const el = elementRef.current;
    if (el) el.removeAttribute("data-resizing");
    setIsResizing(false);
    resizeRef.current = null;
    if (onGuide) onGuide([]);
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", stopResize);
  };

  /* ---------------- Styles ---------------- */

  const inlineStyle = useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {
      transition: isResizing
        ? "none"
        : "box-shadow 120ms ease, outline 120ms ease",
      boxSizing: "border-box",
    };

    if (!css) return style;

    if (css.display) style.display = css.display;
    if (css.width) style.width = css.width;
    if (css.height) style.height = css.height;

    if (css.padding) style.padding = css.padding;
    if (css.margin) style.margin = css.margin;

    const bg = resolveBackground(css);
    if (bg) style.background = bg;

    if (css.color) style.color = css.color;
    if (css.fontSize) style.fontSize = css.fontSize;
    if (css.fontWeight) style.fontWeight = css.fontWeight;
    if (css.lineHeight) style.lineHeight = css.lineHeight;
    if (css.textAlign) style.textAlign = css.textAlign;

    if (css.borderRadius) style.borderRadius = css.borderRadius;
    if (css.boxShadow) style.boxShadow = css.boxShadow;
    if (css.opacity !== undefined) style.opacity = css.opacity;

    if (css.position) style.position = css.position;
    if (css.top) style.top = css.top;
    if (css.left) style.left = css.left;
    if (css.right) style.right = css.right;
    if (css.bottom) style.bottom = css.bottom;

    return style;
  }, [css, isResizing]);

  /* ---------------- Click (selection) ---------------- */

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectElement(elementId, e.ctrlKey || e.metaKey);
    },
    [selectElement, elementId]
  );

  /* ---------------- Cleanup on unmount ---------------- */

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onResizeMove);
      window.removeEventListener("mouseup", stopResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Render ---------------- */

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      style={inlineStyle}
      data-resizing={isResizing ? "true" : "false"}
      data-element-id={elementId}
      className={`relative ${
        isSelected
          ? "outline outline-2 outline-blue-500 outline-offset-2"
          : "hover:outline hover:outline-1 hover:outline-gray-400"
      } ${className}`}
    >
      {/* Resize handles */}
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
              className={`absolute w-2.5 h-2.5 bg-white border border-blue-500 rounded-sm pointer-events-auto ${cls}`}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
