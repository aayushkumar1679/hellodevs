"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useCanvasStore } from "@/state/useCanvasStore";
import ComponentRenderer from "./ComponentRenderer";

type ComponentWrapperProps = {
  component: any;
};

export default function ComponentWrapper({ component }: ComponentWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });
  const {
    selectedComponentId,
    selectComponent,
    removeComponent,
    duplicateComponent,
  } = useCanvasStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedComponentId === component.id;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      className={`relative border-2 rounded-lg transition ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="cursor-grab active:cursor-grabbing">
        <ComponentRenderer component={component} />
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(component.id);
            }}
            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
            title="Duplicate (D)"
          >
            📋
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeComponent(component.id);
            }}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
            title="Delete"
          >
            ✕
          </button>
        </div>
      )}
    </motion.div>
  );
}
