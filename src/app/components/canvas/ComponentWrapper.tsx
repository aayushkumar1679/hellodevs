"use client";

import React from "react";
import { useDesignStore } from "@/state/useDesignStore";
import { useCanvasStore } from "@/state/useCanvasStore";
import { Trash2 } from "lucide-react";
import ComponentRenderer from "./ComponentRenderer";

interface ComponentWrapperProps {
  component: any;
}

export default function ComponentWrapper({ component }: ComponentWrapperProps) {
  const { selectElement, selectedElements } = useDesignStore();
  const { removeComponent } = useCanvasStore();
  const isSelected = selectedElements.includes(component.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(component.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-4 rounded transition-all cursor-pointer group ${
        isSelected
          ? "border-2 border-blue-500 bg-blue-50"
          : "border-2 border-transparent hover:border-gray-300 bg-white"
      }`}
    >
      <ComponentRenderer component={component} />

      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(component.id);
          }}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
          title="Delete component"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
