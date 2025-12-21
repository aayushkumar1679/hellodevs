"use client";

import React from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { Plus } from "lucide-react";

const COMPONENTS = [
  { type: "navbar", label: "Navbar", description: "Navigation bar" },
  { type: "hero", label: "Hero", description: "Hero section" },
  { type: "card", label: "Card", description: "Content card" },
  { type: "button", label: "Button", description: "Button element" },
  { type: "form", label: "Form", description: "Form element" },
  { type: "section", label: "Section", description: "Generic section" },
  { type: "text", label: "Text", description: "Text element" },
  { type: "image", label: "Image", description: "Image element" },
];

export default function ComponentLibrary() {
  const { addComponent } = useCanvasStore();
  const { addElement } = useDesignStore();

  const handleAddComponent = (type: string) => {
    const componentId = addComponent(type);
    addElement(componentId, type);
  };

  return (
    <div className="p-3 space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
        Components
      </p>
      <div className="space-y-1">
        {COMPONENTS.map((comp) => (
          <button
            key={comp.type}
            onClick={() => handleAddComponent(comp.type)}
            className="w-full flex items-center gap-2 px-2 py-2 text-left text-xs text-gray-300 hover:bg-gray-700 rounded transition-colors group"
          >
            <Plus
              size={14}
              className="text-gray-500 group-hover:text-gray-300"
            />
            <div className="flex-1">
              <p className="font-medium">{comp.label}</p>
              <p className="text-gray-500">{comp.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
