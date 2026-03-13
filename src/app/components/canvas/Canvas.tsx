// src/app/components/canvas/Canvas.tsx
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { useEditorStore } from "@/state/useEditorStore";
import CanvasElement, { CanvasElementProps } from "./CanvasElement";
import ComponentWrapper from "./ComponentWrapper";
import { useSyncStores } from "@/hooks/useSyncStores";
import { getProjectRootIds } from "@/utils/projectModel";

/* ----------------------------------------
 Types
----------------------------------------- */

type Rect = { x: number; y: number; w: number; h: number };
type Guide = { x?: number; y?: number };
type CanvasOverlayRect = { left: number; top: number; width: number; height: number };

type DistanceLabel = {
  x: number;
  y: number;
  value: number;
  axis: "x" | "y";
};

type ElementPosition = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type GroupChildRelation = {
  relL: number;
  relT: number;
  relW: number;
  relH: number;
};

/* ========================================
 Canvas
======================================== */

export default function Canvas() {
  const { currentProject } = useCanvasStore();

  // design helpers
  const { deselectAll, selectElement, selectedElements, updateCSSProperty } =
    useDesignStore();

  /* ✅ SINGLE SOURCE OF TRUTH */
  const { activeBreakpoint, breakpoints, previewEnabled } = useEditorStore();

  useSyncStores();

  const viewportWidth = breakpoints[activeBreakpoint].width;

  /* ------------------------------------
   Selection & rect registry
------------------------------------- */

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const elementRects = useRef<Record<string, DOMRect>>({}); // client coords

  const [selectionBox, setSelectionBox] = useState<Rect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [distanceLabels, setDistanceLabels] = useState<DistanceLabel[]>([]);
  const [canvasRectForRender, setCanvasRectForRender] = useState<CanvasOverlayRect | null>(null);
  const [groupBoxLocal, setGroupBoxLocal] = useState<Rect | null>(null);
  const isResizingRef = useRef(false);

  const computeGroupBox = useCallback((): DOMRect | null => {
    if (selectedElements.length < 2) return null;
    const rects = selectedElements
      .map((id) => elementRects.current[id])
      .filter(Boolean);
    if (rects.length < 2) return null;
    const left = Math.min(...rects.map((r) => r.left));
    const top = Math.min(...rects.map((r) => r.top));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    return new DOMRect(left, top, right - left, bottom - top);
  }, [selectedElements]);

  const syncOverlayMetrics = useCallback(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) {
      setCanvasRectForRender(null);
      setGroupBoxLocal(null);
      return;
    }

    const canvasRect = canvasEl.getBoundingClientRect();
    const nextCanvasRect = {
      left: canvasRect.left,
      top: canvasRect.top,
      width: canvasRect.width,
      height: canvasRect.height,
    };

    setCanvasRectForRender((prev) => {
      if (
        prev &&
        prev.left === nextCanvasRect.left &&
        prev.top === nextCanvasRect.top &&
        prev.width === nextCanvasRect.width &&
        prev.height === nextCanvasRect.height
      ) {
        return prev;
      }

      return nextCanvasRect;
    });

    const groupBoxClient = computeGroupBox();
    const nextGroupBoxLocal = groupBoxClient
      ? {
          x: Math.round(groupBoxClient.left - canvasRect.left),
          y: Math.round(groupBoxClient.top - canvasRect.top),
          w: Math.round(groupBoxClient.width),
          h: Math.round(groupBoxClient.height),
        }
      : null;

    setGroupBoxLocal((prev) => {
      if (
        prev &&
        nextGroupBoxLocal &&
        prev.x === nextGroupBoxLocal.x &&
        prev.y === nextGroupBoxLocal.y &&
        prev.w === nextGroupBoxLocal.w &&
        prev.h === nextGroupBoxLocal.h
      ) {
        return prev;
      }

      return nextGroupBoxLocal;
    });
  }, [computeGroupBox]);

  const registerRect = useCallback((id: string, rect: DOMRect) => {
    elementRects.current[id] = rect;
    isResizingRef.current = true;
    syncOverlayMetrics();
  }, [syncOverlayMetrics]);

  // helper to detect if the event target is a resize handle or a currently resizing element
  const isResizingElement = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest('[data-resizing="true"]') ||
        target.closest('[data-resize-handle="true"]')
    );
  };

  /* ----------------
     Drag / Move
     ---------------- */

  const movingRef = useRef<{
    startX: number;
    startY: number;
    initialPositions: Record<string, ElementPosition>;
    movingIds: string[];
  } | null>(null);

  const [guides, setGuides] = useState<Guide[]>([]);

  const GRID = 8; // snap to 8px grid
  const SNAP_THRESHOLD = 8; // px for snapping to other edges/centers

  const snapToGrid = (n: number) => Math.round(n / GRID) * GRID;

  // compute snap targets from elementRects (client coords)
  const buildSnapTargets = useCallback(() => {
    const targets = { xs: new Set<number>(), ys: new Set<number>() };
    const rects = elementRects.current;
    Object.keys(rects).forEach((id) => {
      const r = rects[id];
      targets.xs.add(Math.round(r.left));
      targets.xs.add(Math.round(r.right));
      targets.xs.add(Math.round(r.left + r.width / 2));
      targets.ys.add(Math.round(r.top));
      targets.ys.add(Math.round(r.bottom));
      targets.ys.add(Math.round(r.top + r.height / 2));
    });
    return {
      xs: Array.from(targets.xs).sort((a, b) => a - b),
      ys: Array.from(targets.ys).sort((a, b) => a - b),
    };
  }, []);

  function findClosest(targets: number[], value: number) {
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

  const computeDistanceLabels = useCallback((
    movingIds: string[],
    allRects: Record<string, DOMRect>,
    canvasRect: DOMRect
  ): DistanceLabel[] => {
    const labels: DistanceLabel[] = [];

    movingIds.forEach((id) => {
      const a = allRects[id];
      if (!a) return;

      Object.entries(allRects).forEach(([otherId, b]) => {
        if (movingIds.includes(otherId)) return;

        // vertical alignment → horizontal distance
        if (Math.abs(a.top - b.top) < 2 || Math.abs(a.bottom - b.bottom) < 2) {
          const gap =
            b.left > a.right
              ? b.left - a.right
              : a.left > b.right
              ? a.left - b.right
              : null;

          if (gap !== null && gap > 0) {
            labels.push({
              axis: "x",
              value: Math.round(gap),
              x: Math.min(a.right, b.right) - canvasRect.left + gap / 2,
              y: a.top - canvasRect.top - 12,
            });
          }
        }

        // horizontal alignment → vertical distance
        if (Math.abs(a.left - b.left) < 2 || Math.abs(a.right - b.right) < 2) {
          const gap =
            b.top > a.bottom
              ? b.top - a.bottom
              : a.top > b.bottom
              ? a.top - b.bottom
              : null;

          if (gap !== null && gap > 0) {
            labels.push({
              axis: "y",
              value: Math.round(gap),
              x: a.left - canvasRect.left - 20,
              y: Math.min(a.bottom, b.bottom) - canvasRect.top + gap / 2,
            });
          }
        }
      });
    });

    return labels;
  }, []);

  const updateDistanceLabelsForResize = useCallback(() => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    // use currently selected elements if possible
    const activeIds =
      selectedElements.length > 0
        ? selectedElements
        : Object.keys(elementRects.current);

    const labels = computeDistanceLabels(
      activeIds,
      elementRects.current,
      canvasRect
    );

    setDistanceLabels(labels);
  }, [computeDistanceLabels, selectedElements]);

  useEffect(() => {
    if (!isResizingRef.current) return;
    updateDistanceLabelsForResize();
  }, [selectedElements, updateDistanceLabelsForResize]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      syncOverlayMetrics();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentProject?.id, previewEnabled, selectionBox, syncOverlayMetrics, viewportWidth]);

  useEffect(() => {
    const handleViewportChange = () => {
      syncOverlayMetrics();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [syncOverlayMetrics]);

  /* ---------------- Move handlers ---------------- */

  const startMove = (e: MouseEvent | React.MouseEvent) => {
    // don't start move if user clicked on a resize handle or resizing element
    if (isResizingElement(e.target)) return;

    const target = e.target instanceof HTMLElement ? e.target : null;
    const elNode = target?.closest("[data-element-id]") as HTMLElement | null;
    if (!elNode || !canvasRef.current) return;

    const clickedId = elNode.getAttribute("data-element-id");
    if (!clickedId) return;

    if (!selectedElements.includes(clickedId)) {
      selectElement(clickedId, false);
    }

    const movingIds = [
      ...(selectedElements.includes(clickedId)
        ? selectedElements
        : [clickedId]),
    ];

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const initialPositions: Record<string, ElementPosition> = {};
    movingIds.forEach((id) => {
      const r = elementRects.current[id];
      if (!r) return;
      initialPositions[id] = {
        left: Math.round(r.left - canvasRect.left),
        top: Math.round(r.top - canvasRect.top),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    });

    movingRef.current = {
      startX: (e as MouseEvent).clientX,
      startY: (e as MouseEvent).clientY,
      initialPositions,
      movingIds,
    };

    e.preventDefault();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stopMove);
  };

  const onMove = (ev: MouseEvent) => {
    if (!movingRef.current || !canvasRef.current) return;
    ev.preventDefault();

    const { startX, startY, initialPositions, movingIds } = movingRef.current;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const snapTargets = buildSnapTargets();

    const firstId = movingIds[0];
    const anchor = initialPositions[firstId];
    if (!anchor) return;

    const candidateLeft = anchor.left + dx;
    const candidateTop = anchor.top + dy;

    // grid snap (local)
    const snappedLeftLocal = snapToGrid(candidateLeft);
    const snappedTopLocal = snapToGrid(candidateTop);

    // attempt snapping to other edges (client coords)
    const anchorClientLeft = canvasRect.left + candidateLeft;
    const anchorClientTop = canvasRect.top + candidateTop;
    const anchorClientRight = anchorClientLeft + anchor.width;
    const anchorClientBottom = anchorClientTop + anchor.height;
    const anchorCenterX = Math.round(anchorClientLeft + anchor.width / 2);
    const anchorCenterY = Math.round(anchorClientTop + anchor.height / 2);

    const { xs, ys } = snapTargets;
    const { best: bestXLeft, dist: distLeft } = findClosest(
      xs,
      Math.round(anchorClientLeft)
    );
    const { best: bestXRight, dist: distRight } = findClosest(
      xs,
      Math.round(anchorClientRight)
    );
    const { best: bestXCenter, dist: distCenterX } = findClosest(
      xs,
      anchorCenterX
    );

    let finalClientLeft = anchorClientLeft;
    let finalClientTop = anchorClientTop;
    const newGuides: Guide[] = [];

    if (bestXLeft !== null && distLeft <= SNAP_THRESHOLD) {
      finalClientLeft = bestXLeft;
      newGuides.push({ x: bestXLeft });
    } else if (bestXRight !== null && distRight <= SNAP_THRESHOLD) {
      finalClientLeft = bestXRight - anchor.width;
      newGuides.push({ x: bestXRight });
    } else if (bestXCenter !== null && distCenterX <= SNAP_THRESHOLD) {
      finalClientLeft = bestXCenter - Math.round(anchor.width / 2);
      newGuides.push({ x: bestXCenter });
    } else {
      finalClientLeft = canvasRect.left + snappedLeftLocal;
    }

    const { best: bestYTop, dist: distTop } = findClosest(
      ys,
      Math.round(anchorClientTop)
    );
    const { best: bestYBottom, dist: distBottom } = findClosest(
      ys,
      Math.round(anchorClientBottom)
    );
    const { best: bestYCenter, dist: distCenterY } = findClosest(
      ys,
      anchorCenterY
    );

    if (bestYTop !== null && distTop <= SNAP_THRESHOLD) {
      finalClientTop = bestYTop;
      newGuides.push({ y: bestYTop });
    } else if (bestYBottom !== null && distBottom <= SNAP_THRESHOLD) {
      finalClientTop = bestYBottom - anchor.height;
      newGuides.push({ y: bestYBottom });
    } else if (bestYCenter !== null && distCenterY <= SNAP_THRESHOLD) {
      finalClientTop = bestYCenter - Math.round(anchor.height / 2);
      newGuides.push({ y: bestYCenter });
    } else {
      finalClientTop = canvasRect.top + snappedTopLocal;
    }

    const finalLeftLocal = Math.round(finalClientLeft - canvasRect.left);
    const finalTopLocal = Math.round(finalClientTop - canvasRect.top);

    movingIds.forEach((id) => {
      const init = initialPositions[id];
      if (!init) return;
      const offsetX = init.left - anchor.left;
      const offsetY = init.top - anchor.top;
      const newLeft = finalLeftLocal + offsetX;
      const newTop = finalTopLocal + offsetY;

      const boundedLeft = Math.max(0, Math.round(newLeft));
      const boundedTop = Math.max(0, Math.round(newTop));

      updateCSSProperty(id, "position", "absolute");
      updateCSSProperty(id, "left", `${boundedLeft}px`);
      updateCSSProperty(id, "top", `${boundedTop}px`);

      const prevRect = elementRects.current[id];
      if (prevRect) {
        elementRects.current[id] = new DOMRect(
          canvasRect.left + boundedLeft,
          canvasRect.top + boundedTop,
          prevRect.width,
          prevRect.height
        );
      }
    });

    // distance labels
    const distance = computeDistanceLabels(
      movingIds,
      elementRects.current,
      canvasRect
    );
    setDistanceLabels(distance);
    syncOverlayMetrics();

    // convert guides to canvas-local coords
    setGuides(
      newGuides.map((g) => {
        const canvasRect2 = canvasRef.current!.getBoundingClientRect();
        const mapped: Guide = {};
        if (g.x !== undefined) mapped.x = g.x - canvasRect2.left;
        if (g.y !== undefined) mapped.y = g.y - canvasRect2.top;
        return mapped;
      })
    );
  };

  const stopMove = () => {
    movingRef.current = null;
    setGuides([]);
    syncOverlayMetrics();
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", stopMove);
    setDistanceLabels([]);
    // isResizingRef.current = false;
  };

  /* ------------------------------------
   Marquee / selection + start move
------------------------------------- */

  const handleMouseDown = (e: React.MouseEvent) => {
    // don't start marquee if resizing
    if (isResizingElement(e.target)) return;

    const target = e.target as HTMLElement | null;
    const elNode = target?.closest("[data-element-id]") as HTMLElement | null;

    if (elNode && canvasRef.current) {
      // allow startMove to attach window listeners
      startMove(e);
      return;
    }

    if (e.target !== e.currentTarget) return;

    deselectAll();
    setIsDragging(true);
    syncOverlayMetrics();

    startPoint.current = { x: e.clientX, y: e.clientY };
    setSelectionBox({
      x: e.clientX,
      y: e.clientY,
      w: 0,
      h: 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPoint.current) return;

    const x = Math.min(startPoint.current.x, e.clientX);
    const y = Math.min(startPoint.current.y, e.clientY);
    const w = Math.abs(startPoint.current.x - e.clientX);
    const h = Math.abs(startPoint.current.y - e.clientY);

    setSelectionBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!selectionBox) {
      // stopMove will handle movement stop if there was one
      return;
    }

    Object.entries(elementRects.current).forEach(([id, rect]) => {
      const intersects =
        rect.left < selectionBox.x + selectionBox.w &&
        rect.right > selectionBox.x &&
        rect.top < selectionBox.y + selectionBox.h &&
        rect.bottom > selectionBox.y;

      if (intersects) {
        selectElement(id, true);
      }
    });

    startPoint.current = null;
    setSelectionBox(null);
    setIsDragging(false);
  };

  /* ------------------------------------
   Snap wiring for CanvasElement
   ------------------------------------ */

  const getSnapTargets = useCallback(() => {
    // returns client-space arrays
    const targets = buildSnapTargets();
    return targets;
  }, [buildSnapTargets]);

  const onElementGuide = useCallback(
    (guidesClient: Array<{ x?: number; y?: number }>) => {
      // map client coords -> canvas-local coords for drawing
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mapped = guidesClient.map((g) => {
        const out: Guide = {};
        if (g.x !== undefined) out.x = g.x - canvasRect.left;
        if (g.y !== undefined) out.y = g.y - canvasRect.top;
        return out;
      });
      setGuides(mapped);
    },
    []
  );

  /* ------------------------------------
   Multi-select bounding box + group resize
------------------------------------- */

  const groupResizeRef = useRef<{
    startX: number;
    startY: number;
    boxLeft: number;
    boxTop: number;
    boxW: number;
    boxH: number;
    aspect: number;
    fromCenter: boolean;
    lockRatio: boolean;
    childrenRel: Record<
      string,
      GroupChildRelation
    >;
    dir: string;
  } | null>(null);

  const startGroupResize = (e: React.MouseEvent, dir: string) => {
    e.preventDefault();
    e.stopPropagation();

    const box = computeGroupBox();
    if (!box) return;

    const childrenRel: Record<string, GroupChildRelation> = {};
    selectedElements.forEach((id) => {
      const r = elementRects.current[id];
      if (!r) return;
      childrenRel[id] = {
        relL: (r.left - box.left) / box.width,
        relT: (r.top - box.top) / box.height,
        relW: r.width / box.width,
        relH: r.height / box.height,
      };
    });

    groupResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      boxLeft: box.left,
      boxTop: box.top,
      boxW: box.width,
      boxH: box.height,
      aspect: box.width / box.height,
      fromCenter: e.altKey,
      lockRatio: e.shiftKey,
      childrenRel,
      dir,
    };
    window.addEventListener("mousemove", onGroupResizeMove);
    window.addEventListener("mouseup", stopGroupResize);
  };

  const onGroupResizeMove = (ev: MouseEvent) => {
    const s = groupResizeRef.current;
    if (!s || !canvasRef.current) return;
    ev.preventDefault();

    const {
      startX,
      startY,
      boxLeft,
      boxTop,
      boxW,
      boxH,
      aspect,
      fromCenter,
      lockRatio,
      childrenRel,
      dir,
    } = s;

    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    let newLeft = boxLeft;
    let newTop = boxTop;
    let newW = boxW;
    let newH = boxH;

    if (dir.includes("e")) newW = boxW + dx;
    if (dir.includes("s")) newH = boxH + dy;
    if (dir.includes("w")) {
      newW = boxW - dx;
      newLeft = boxLeft + dx;
    }
    if (dir.includes("n")) {
      newH = boxH - dy;
      newTop = boxTop + dy;
    }

    if (lockRatio) {
      if (Math.abs(newW / newH - aspect) > 0.01) {
        if (dir.includes("e") || dir.includes("w")) {
          newH = newW / aspect;
        } else {
          newW = newH * aspect;
        }
      }
    }

    if (fromCenter) {
      const cx = boxLeft + boxW / 2;
      const cy = boxTop + boxH / 2;
      newLeft = cx - newW / 2;
      newTop = cy - newH / 2;
    }

    newW = Math.max(16, snapToGrid(newW));
    newH = Math.max(16, snapToGrid(newH));
    newLeft = snapToGrid(newLeft);
    newTop = snapToGrid(newTop);

    const canvasRect = canvasRef.current.getBoundingClientRect();

    Object.entries(childrenRel).forEach(([id, rel]) => {
      const left = Math.round(newLeft - canvasRect.left + rel.relL * newW);
      const top = Math.round(newTop - canvasRect.top + rel.relT * newH);
      const w = Math.round(rel.relW * newW);
      const h = Math.round(rel.relH * newH);

      updateCSSProperty(id, "position", "absolute");
      updateCSSProperty(id, "left", `${left}px`);
      updateCSSProperty(id, "top", `${top}px`);
      updateCSSProperty(id, "width", `${Math.max(10, w)}px`);
      updateCSSProperty(id, "height", `${Math.max(10, h)}px`);

      elementRects.current[id] = new DOMRect(
        canvasRect.left + left,
        canvasRect.top + top,
        Math.max(10, w),
        Math.max(10, h)
      );
    });

    setGuides([]);
    updateDistanceLabelsForResize();
    syncOverlayMetrics();
  };

  const stopGroupResize = () => {
    groupResizeRef.current = null;
    setGuides([]);
    syncOverlayMetrics();
    window.removeEventListener("mousemove", onGroupResizeMove);
    window.removeEventListener("mouseup", stopGroupResize);
    // isResizingRef.current = false;
  };

  /* ------------------------------------
   Rendering & helpers
------------------------------------- */

  const rootComponentIds = currentProject ? getProjectRootIds(currentProject) : [];

  const renderCanvasNode = (nodeId: string): React.ReactNode => {
    const component = currentProject?.components[nodeId];
    if (!component) {
      return null;
    }

    // Determine the semantic tag for this component type
    let asTag: CanvasElementProps["as"] = "div";
    switch (component.type) {
      case "section":
        asTag = "section";
        break;
      case "navbar":
        asTag = "nav";
        break;
      case "card":
      case "product-card":
      case "pricing-card":
        asTag = "article";
        break;
      case "form":
        asTag = "form";
        break;
      case "footer":
        asTag = "footer";
        break;
      default:
        asTag = "div";
    }

    return (
      <CanvasElement
        key={component.id}
        elementId={component.id}
        onRect={(rect) => registerRect(component.id, rect)}
        getSnapTargets={getSnapTargets}
        onGuide={onElementGuide}
        as={asTag}
      >
        <ComponentWrapper component={component} />
        {component.children.map((childId) => renderCanvasNode(childId))}
      </CanvasElement>
    );
  };

  useEffect(() => {
    const onMouseUp = () => {
      isResizingRef.current = false;
      setDistanceLabels([]);
    };

    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-auto select-none bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.15),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_18%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />

      {/* Marquee */}
      {selectionBox && canvasRectForRender && (
        <div
          className="absolute z-50 border border-blue-400 bg-blue-400/10 pointer-events-none rounded"
          style={{
            left: selectionBox.x - canvasRectForRender.left,
            top: selectionBox.y - canvasRectForRender.top,
            width: selectionBox.w,
            height: selectionBox.h,
          }}
        />
      )}

      {/* Guides */}
      {guides.map((g, i) => (
        <React.Fragment key={i}>
          {g.x !== undefined && (
            <div
              className="absolute z-60 bg-blue-400/70 pointer-events-none transition-all"
              style={{
                left: g.x,
                top: 0,
                bottom: 0,
                width: 1,
              }}
            />
          )}
          {g.y !== undefined && (
            <div
              className="absolute z-60 bg-blue-400/70 pointer-events-none transition-all"
              style={{
                top: g.y,
                left: 0,
                right: 0,
                height: 1,
              }}
            />
          )}
        </React.Fragment>
      ))}
      {/* Distance Labels */}
      {distanceLabels.map((d, i) => (
        <div
          key={i}
          className="absolute z-60 text-[10px] font-medium text-white bg-pink-600/90 px-1 rounded pointer-events-none shadow"
          style={{
            left: d.x,
            top: d.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {d.value}px
        </div>
      ))}

      <div className="flex justify-center px-8 py-12">
        <div
          className="relative min-h-screen overflow-hidden rounded-[36px] border border-white/70 bg-white/92 shadow-[0_45px_120px_-65px_rgba(15,23,42,0.55)] transition-[width] duration-200"
          style={{ width: previewEnabled ? viewportWidth : Math.max(viewportWidth, 1320) }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_65%)]" />
          <div className="relative space-y-4 p-8">
            {rootComponentIds.length === 0 ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="max-w-md rounded-[32px] border border-dashed border-slate-300 bg-slate-50/90 px-8 py-10 text-center shadow-inner">
                  <p className="text-sm font-semibold text-slate-900">
                    Your canvas is ready.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Start with the AI panel for a full page, or drag components in
                    manually to shape the layout.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {groupBoxLocal && (
                  <div
                    className="absolute pointer-events-auto z-50 animate-in fade-in zoom-in-95 duration-200"
                    style={{
                      left: groupBoxLocal.x,
                      top: groupBoxLocal.y,
                      width: groupBoxLocal.w,
                      height: groupBoxLocal.h,
                      boxSizing: "border-box",
                      border: "2px solid #0ea5e9",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.8), 0 0 20px rgba(14,165,233,0.3), inset 0 0 12px rgba(14,165,233,0.1)",
                      background: "rgba(14,165,233,0.02)",
                    }}
                  >
                    {/* Perspective lines corner helpers */}
                    <div className="absolute -left-1 -top-1 h-3 w-3 border-l-2 border-t-2 border-sky-500" />
                    <div className="absolute -right-1 -top-1 h-3 w-3 border-r-2 border-t-2 border-sky-500" />
                    <div className="absolute -left-1 -bottom-1 h-3 w-3 border-l-2 border-b-2 border-sky-500" />
                    <div className="absolute -right-1 -bottom-1 h-3 w-3 border-r-2 border-b-2 border-sky-500" />

                    {(
                      [
                        ["nw", "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize"],
                        ["n", "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize"],
                        ["ne", "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize"],
                        ["e", "top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize"],
                        ["se", "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize"],
                        ["s", "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize"],
                        ["sw", "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize"],
                        ["w", "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize"],
                      ] as [string, string][]
                    ).map(([dir, cls]) => (
                      <div
                        key={dir}
                        role="button"
                        data-resize-handle="true"
                        onMouseDown={(e) => startGroupResize(e, dir)}
                        className={`absolute h-3.5 w-3.5 rounded-full border-2 border-sky-500 bg-white shadow-xl transition-transform hover:scale-150 active:scale-95 ${cls}`}
                      />
                    ))}
                  </div>
                )}

                {rootComponentIds.map((componentId) => renderCanvasNode(componentId))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
