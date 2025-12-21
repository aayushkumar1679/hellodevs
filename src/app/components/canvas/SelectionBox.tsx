"use client";

import React, { useRef, useState } from "react";
import { useDesignStore } from "@/state/useDesignStore";

type SelectionBoxProps = {
  element: HTMLElement;
  elementId: string;
};

export default function SelectionBox({
  element,
  elementId,
}: SelectionBoxProps) {
  const { updateCSSProperty } = useDesignStore();
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const rect = element.getBoundingClientRect();
  const parentRect = element.parentElement?.getBoundingClientRect();

  const top = parentRect ? rect.top - parentRect.top : rect.top;
  const left = parentRect ? rect.left - parentRect.left : rect.left;
  const width = rect.width;
  const height = rect.height;

  const handles = [
    { position: "top-left", cursor: "nwse-resize", x: 0, y: 0 },
    { position: "top-right", cursor: "nesw-resize", x: 1, y: 0 },
    { position: "bottom-left", cursor: "nesw-resize", x: 0, y: 1 },
    { position: "bottom-right", cursor: "nwse-resize", x: 1, y: 1 },
    { position: "top", cursor: "ns-resize", x: 0.5, y: 0 },
    { position: "right", cursor: "ew-resize", x: 1, y: 0.5 },
    { position: "bottom", cursor: "ns-resize", x: 0.5, y: 1 },
    { position: "left", cursor: "ew-resize", x: 0, y: 0.5 },
  ];

  const handleMouseDown = (position: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(position);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width,
      height,
    };
  };

  return (
    <div
      className="absolute border-2 border-blue-500 pointer-events-none"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Handles */}
      {handles.map((handle) => (
        <div
          key={handle.position}
          onMouseDown={(e) => handleMouseDown(handle.position, e)}
          className="absolute w-2 h-2 bg-blue-500 border border-white cursor-move pointer-events-auto"
          style={{
            top: `${handle.y * height - 4}px`,
            left: `${handle.x * width - 4}px`,
            cursor: handle.cursor,
          }}
        />
      ))}

      {/* Outline */}
      <div className="absolute inset-0 border border-blue-500 pointer-events-none" />
    </div>
  );
}
