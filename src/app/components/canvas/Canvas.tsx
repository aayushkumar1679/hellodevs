// src/app/components/canvas/Canvas.tsx
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { useEditorStore } from "@/state/useEditorStore";
import CanvasElement from "./CanvasElement";
import ComponentWrapper from "./ComponentWrapper";
import { useSyncStores } from "@/hooks/useSyncStores";

/* ----------------------------------------
 Types
----------------------------------------- */

type Rect = { x: number; y: number; w: number; h: number };
type Guide = { x?: number; y?: number };

type DistanceLabel = {
  x: number;
  y: number;
  value: number;
  axis: "x" | "y";
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
  const isResizingRef = useRef(false);

  const registerRect = useCallback((id: string, rect: DOMRect) => {
    elementRects.current[id] = rect;
    isResizingRef.current = true;
  }, []);

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
    initialPositions: Record<
      string,
      { left: number; top: number; width: number; height: number }
    >;
    movingIds: string[];
  } | null>(null);

  const [isMoving, setIsMoving] = useState(false);
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

  // effect
  useEffect(() => {
    if (!isResizingRef.current) return;
    updateDistanceLabelsForResize();
  }, [selectedElements]);

  // Add helper to compute distances

  function computeDistanceLabels(
    movingIds: string[],
    allRects: Record<string, DOMRect>,
    canvasRect: DOMRect
  ): DistanceLabel[] {
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
  }

  function updateDistanceLabelsForResize() {
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
  }

  /* ---------------- Move handlers ---------------- */

  const startMove = (e: MouseEvent | React.MouseEvent) => {
    // don't start move if user clicked on a resize handle or resizing element
    if (isResizingElement((e as any).target)) return;

    const target = (e as any).target as HTMLElement | null;
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
    const initialPositions: Record<string, any> = {};
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

    setIsMoving(true);

    (e as Event).preventDefault?.();

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

    let candidateLeft = anchor.left + dx;
    let candidateTop = anchor.top + dy;

    // grid snap (local)
    let snappedLeftLocal = snapToGrid(candidateLeft);
    let snappedTopLocal = snapToGrid(candidateTop);

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
    setIsMoving(false);
    movingRef.current = null;
    setGuides([]);
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

  // compute group bounding box (client coords) when multiple selected
  function computeGroupBox(): DOMRect | null {
    if (!canvasRef.current || selectedElements.length < 2) return null;
    const rects = selectedElements
      .map((id) => elementRects.current[id])
      .filter(Boolean);
    if (rects.length < 2) return null;
    const left = Math.min(...rects.map((r) => r.left));
    const top = Math.min(...rects.map((r) => r.top));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    return new DOMRect(left, top, right - left, bottom - top);
  }

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
      {
        relL: number;
        relT: number;
        relW: number;
        relH: number;
      }
    >;
    dir: string;
  } | null>(null);

  const [isGroupResizing, setIsGroupResizing] = useState(false);

  const startGroupResize = (e: React.MouseEvent, dir: string) => {
    e.preventDefault();
    e.stopPropagation();

    const box = computeGroupBox();
    if (!box) return;

    const childrenRel: Record<string, any> = {};
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

    setIsGroupResizing(true);
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

    let dx = ev.clientX - startX;
    let dy = ev.clientY - startY;

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
  };

  const stopGroupResize = () => {
    setIsGroupResizing(false);
    groupResizeRef.current = null;
    setGuides([]);
    window.removeEventListener("mousemove", onGroupResizeMove);
    window.removeEventListener("mouseup", stopGroupResize);
    // isResizingRef.current = false;
  };

  /* ------------------------------------
   Rendering & helpers
------------------------------------- */

  const rootComponents = currentProject
    ? Object.values(currentProject.components).filter(
        (c) =>
          !Object.values(currentProject.components).some((parent) =>
            parent.children.includes(c.id)
          )
      )
    : [];

  // compute canvas-local group box for render (returns {left, top, w, h} local to canvas)
  const groupBoxClient = computeGroupBox();
  const canvasRectForRender = canvasRef.current?.getBoundingClientRect();
  const groupBoxLocal =
    groupBoxClient && canvasRectForRender
      ? {
          left: Math.round(groupBoxClient.left - canvasRectForRender.left),
          top: Math.round(groupBoxClient.top - canvasRectForRender.top),
          w: Math.round(groupBoxClient.width),
          h: Math.round(groupBoxClient.height),
        }
      : null;

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
      className="relative w-full h-full bg-gray-100 overflow-auto select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Marquee */}
      {selectionBox && canvasRectForRender && (
        <div
          className="absolute z-50 border border-blue-400 bg-blue-400/10 pointer-events-none"
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
              className="absolute z-60 bg-blue-400/70 pointer-events-none"
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
              className="absolute z-60 bg-blue-400/70 pointer-events-none"
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
          className="absolute z-60 text-[10px] font-medium text-pink-500 bg-pink-100 px-1 rounded pointer-events-none"
          style={{
            left: d.x,
            top: d.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {d.value}px
        </div>
      ))}

      {/* Viewport */}
      {previewEnabled && (
        <div className="flex justify-center py-12">
          <div
            className="bg-white shadow-md min-h-screen transition-[width] duration-200 relative"
            style={{ width: viewportWidth }}
          >
            <div className="p-8 space-y-4 relative">
              {rootComponents.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-sm">No components added</p>
                  <p className="text-xs">
                    Drag components from the left panel to get started
                  </p>
                </div>
              ) : (
                <>
                  {/* Multi-select bounding box overlay & handles */}
                  {groupBoxLocal && (
                    <div
                      className="absolute pointer-events-auto z-50"
                      style={{
                        left: groupBoxLocal.left,
                        top: groupBoxLocal.top,
                        width: groupBoxLocal.w,
                        height: groupBoxLocal.h,
                        boxSizing: "border-box",
                        border: "1px dashed rgba(59,130,246,0.8)",
                        background: "transparent",
                      }}
                    >
                      {/* handles */}
                      {(
                        [
                          ["nw", "top-0 left-0 cursor-nw-resize"],
                          [
                            "n",
                            "top-0 left-1/2 -translate-x-1/2 cursor-n-resize",
                          ],
                          ["ne", "top-0 right-0 cursor-ne-resize"],
                          [
                            "e",
                            "top-1/2 right-0 -translate-y-1/2 cursor-e-resize",
                          ],
                          ["se", "bottom-0 right-0 cursor-se-resize"],
                          [
                            "s",
                            "bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize",
                          ],
                          ["sw", "bottom-0 left-0 cursor-sw-resize"],
                          [
                            "w",
                            "top-1/2 left-0 -translate-y-1/2 cursor-w-resize",
                          ],
                        ] as [string, string][]
                      ).map(([dir, cls]) => (
                        <div
                          key={dir}
                          role="button"
                          data-resize-handle="true"
                          onMouseDown={(e) => startGroupResize(e, dir)}
                          className={`absolute w-3 h-3 bg-white border border-blue-500 rounded-sm ${cls}`}
                          style={{ transform: undefined }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Components */}
                  {rootComponents.map((component) => (
                    <CanvasElement
                      key={component.id}
                      elementId={component.id}
                      onRect={(rect) => registerRect(component.id, rect)}
                      getSnapTargets={() => buildSnapTargets()}
                      onGuide={(g) => onElementGuide(g)}
                    >
                      <ComponentWrapper component={component} />
                    </CanvasElement>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
