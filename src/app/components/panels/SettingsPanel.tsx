"use client";

import React from "react";
import { useDesignStore } from "@/state/useDesignStore";
import PropertySection from "../editor/PropertySection";

export default function SettingsPanel() {
  const { selectedElements, elements } = useDesignStore();
  const [expandedSections, setExpandedSections] = React.useState<string[]>([
    "general",
  ]);

  if (selectedElements.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center h-full">
        <div>
          <p className="font-medium mb-1">No Element Selected</p>
          <p className="text-xs text-gray-500">
            Select an element to view settings
          </p>
        </div>
      </div>
    );
  }

  //  FIX
  const selectedElementId = selectedElements[0];
  if (!selectedElementId) return null;

  const selectedElement = elements[selectedElementId];
  if (!selectedElement) return null;

  return (
    <div className="divide-y divide-gray-700">
      <PropertySection
        title="Element Info"
        isExpanded={expandedSections.includes("general")}
        onToggle={() =>
          setExpandedSections((prev) =>
            prev.includes("general")
              ? prev.filter((id) => id !== "general")
              : [...prev, "general"],
          )
        }
      >
        <div className="space-y-2 text-xs text-gray-400">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-mono">{selectedElement.type}</p>
          </div>
          <div>
            <p className="text-gray-500">ID</p>
            <p className="font-mono text-xs truncate">{selectedElement.id}</p>
          </div>
        </div>
      </PropertySection>
    </div>
  );
}
