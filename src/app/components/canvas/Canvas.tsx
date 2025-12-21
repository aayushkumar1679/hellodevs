"use client";

import React from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import ComponentWrapper from "./ComponentWrapper";

export default function Canvas() {
  const { currentProject } = useCanvasStore();
  const { deselectAll } = useDesignStore();

  if (!currentProject) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-700">
        <div className="text-center text-gray-400">
          <p className="text-sm">No project loaded</p>
          <p className="text-xs">Create or select a project to begin</p>
        </div>
      </div>
    );
  }

  const components = Object.values(currentProject.components).filter(
    (c) =>
      !Object.values(currentProject.components).some((parent) =>
        parent.children.includes(c.id)
      )
  );

  return (
    <div
      className="w-full h-full p-8 bg-white overflow-auto"
      onClick={deselectAll}
    >
      <div className="max-w-6xl mx-auto space-y-4">
        {components.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-sm">No components added</p>
            <p className="text-xs">
              Drag components from the left panel to get started
            </p>
          </div>
        ) : (
          components.map((component) => (
            <ComponentWrapper key={component.id} component={component} />
          ))
        )}
      </div>
    </div>
  );
}
