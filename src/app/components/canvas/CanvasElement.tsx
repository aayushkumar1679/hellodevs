"use client";

import React from "react";
import { useDesignStore } from "@/state/useDesignStore";

interface CanvasElementProps {
  elementId: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that renders canvas elements with styles from design store
 * Handles selection, visual feedback, and inline style application
 */
export function CanvasElement({
  elementId,
  children,
  className = "",
}: CanvasElementProps) {
  const element = useDesignStore((state) => state.elements[elementId]);
  const selectedElements = useDesignStore((state) => state.selectedElements);
  const selectElement = useDesignStore((state) => state.selectElement);

  if (!element) {
    return (
      <div className="p-2 bg-red-900 text-red-100 text-xs rounded">
        Element not found: {elementId}
      </div>
    );
  }

  const isSelected = selectedElements.includes(elementId);
  const cssProps = element.cssProperties || {};

  // Convert CSS object to inline React styles
  const inlineStyle: React.CSSProperties = {
    // Layout
    display: cssProps.display || "block",
    width: cssProps.width ? String(cssProps.width) : undefined,
    height: cssProps.height ? String(cssProps.height) : undefined,

    // Spacing
    padding: cssProps.padding ? String(cssProps.padding) : undefined,
    margin: cssProps.margin ? String(cssProps.margin) : undefined,

    // Colors
    backgroundColor: cssProps.backgroundColor || undefined,
    color: cssProps.color || undefined,

    // Typography
    fontSize: cssProps.fontSize ? String(cssProps.fontSize) : undefined,
    fontWeight: cssProps.fontWeight ? String(cssProps.fontWeight) : "400",
    lineHeight: cssProps.lineHeight ? String(cssProps.lineHeight) : undefined,

    // Effects
    borderRadius: cssProps.borderRadius
      ? String(cssProps.borderRadius)
      : undefined,
    boxShadow: cssProps.boxShadow ? String(cssProps.boxShadow) : undefined,
    opacity: cssProps.opacity !== undefined ? cssProps.opacity : 1,

    // Transitions for smooth selection feedback
    transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent selection
    selectElement(elementId, e.ctrlKey || e.metaKey); // Multi-select with Ctrl/Cmd
  };

  return (
    <div
      onClick={handleClick}
      style={inlineStyle}
      className={`
        relative cursor-pointer group
        ${
          isSelected
            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 shadow-lg"
            : "hover:ring-1 hover:ring-gray-500 hover:ring-offset-1"
        }
        ${className}
      `}
      data-element-id={elementId}
      data-element-type={element.type}
    >
      {/* Selection indicator badge */}
      {isSelected && (
        <div className="absolute -top-8 left-0 bg-blue-600 text-white px-2 py-1 text-xs rounded whitespace-nowrap pointer-events-none">
          Selected
        </div>
      )}

      {/* Element content */}
      {children}

      {/* Debug info (optional - remove in production) */}
      {isSelected && (
        <div className="absolute -bottom-8 left-0 text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
          {element.type} • {elementId}
        </div>
      )}
    </div>
  );
}

export default CanvasElement;
