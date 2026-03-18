"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import DesignerStyles from "@/utils/designerStyles";
import { motion, AnimatePresence } from "framer-motion";

export interface CanvasElementProps {
  elementId: string;
  as?: string;
  className?: string;
  children?: React.ReactNode;
  onRect?: (rect: DOMRect) => void;
  getSnapTargets?: () => { xs: number[]; ys: number[] };
  onGuide?: (guides: Array<{ x?: number; y?: number }>) => void;
}

export default function CanvasElement({
  elementId,
  as,
  className = "",
  children,
  onRect,
  getSnapTargets,
  onGuide,
}: CanvasElementProps) {
  const component = useProjectStore((s) => s.currentProject?.components[elementId]);
  const isSelected = useEditorStore((s) => s.selectedElements.includes(elementId));
  const updateComponentCSSOverride = useProjectStore((s) => s.updateComponentCSSOverride);
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ w: 0, h: 0 });

  const elementRef = React.useRef<HTMLDivElement>(null);

  const inlineStyle = useMemo(() => {
    if (!component) return {};
    return DesignerStyles.resolveForBreakpoint(component.cssOverrides, activeBreakpoint);
  }, [component, activeBreakpoint]);

  const onResizeStart = useCallback(
    (e: React.MouseEvent, dir: string) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);
      setResizeDir(dir);
      setStartPos({ x: e.clientX, y: e.clientY });
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        setStartSize({ w: rect.width, h: rect.height });
      }
    },
    [],
  );

  const onResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeDir) return;
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      if (resizeDir.includes("e")) {
        const newW = Math.max(20, startSize.w + dx);
        updateComponentCSSOverride(elementId, activeBreakpoint, "width", `${newW}px`);
      }
      if (resizeDir.includes("s")) {
        const newH = Math.max(20, startSize.h + dy);
        updateComponentCSSOverride(elementId, activeBreakpoint, "height", `${newH}px`);
      }
      if (resizeDir.includes("w")) {
        const newW = Math.max(20, startSize.w - dx);
        updateComponentCSSOverride(elementId, activeBreakpoint, "width", `${newW}px`);
      }
      if (resizeDir.includes("n")) {
        const newH = Math.max(20, startSize.h - dy);
        updateComponentCSSOverride(elementId, activeBreakpoint, "height", `${newH}px`);
      }
    },
    [
      isResizing,
      resizeDir,
      elementId,
      startPos,
      startSize,
      activeBreakpoint,
      updateComponentCSSOverride,
    ],
  );

  const stopResize = useCallback(() => {
    setIsResizing(false);
    setResizeDir(null);
  }, []);

  // Selection logic removed here; now handled centrally by Canvas.tsx onMouseDown

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", onResizeMove);
      window.addEventListener("mouseup", stopResize);
    }
    return () => {
      window.removeEventListener("mousemove", onResizeMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing, onResizeMove, stopResize]);

  useEffect(() => {
    if (elementRef.current && onRect) {
      onRect(elementRef.current.getBoundingClientRect());
    }
  }, [onRect, inlineStyle, children]);

  if (!component) return null;

  const Component = (as || "div") as React.ElementType;

  return (
    <Component
      ref={elementRef}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={inlineStyle as any}
      data-resizing={isResizing ? "true" : "false"}
      data-element-id={elementId}
      className={`relative transition-shadow duration-150 will-change-transform ${
        isResizing ? "pointer-events-none" : ""
      } ${
        isSelected
          ? "outline outline-2 outline-blue-500 outline-offset-2 shadow-[0_22px_44px_-28px_rgba(59,130,246,0.55)]"
          : "hover:outline hover:outline-1 hover:outline-slate-300 hover:shadow-[0_20_40px_-32px_rgba(15,23,42,0.3)]"
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
            ] as const
          ).map(([dir, classes]) => (
            <div
              key={dir}
              onMouseDown={(e) => onResizeStart(e, dir)}
              className={`absolute z-50 h-2 w-2 rounded-full border border-blue-500 bg-white pointer-events-auto ${classes}`}
            />
          ))}
        </div>
      )}

      {/* Label for selected element */}
      <AnimatePresence>
        {isSelected && !isResizing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-6 left-0 z-50 flex items-center gap-1.5 whitespace-nowrap rounded bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg"
          >
            {component.type.toUpperCase()}
            <span className="opacity-60 font-mono text-[8px]">{elementId.slice(0, 4)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </Component>
  );
}
