"use client";

import React from "react";
import { useDesignStore } from "@/state/useDesignStore";
import PropertySection from "../editor/PropertySection";
import PropertyInput from "../editor/PropertyInput";

export default function StylePanel() {
  const { selectedElements, elements, updateCSSProperty } = useDesignStore();
  const [expandedSections, setExpandedSections] = React.useState<string[]>([
    "layout",
    "size",
  ]);

  if (selectedElements.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center h-full">
        <div>
          <p className="font-medium mb-1">No Element Selected</p>
          <p className="text-xs text-gray-500">
            Click on an element to edit properties
          </p>
        </div>
      </div>
    );
  }

  // ✅ FIX: get first selected element ID
  const selectedElementId = selectedElements[0];
  if (!selectedElementId) return null;

  const selectedElement = elements[selectedElementId];
  if (!selectedElement) return null;

  const sections = [
    {
      id: "layout",
      label: "Layout",
      properties: [
        {
          key: "display",
          label: "Display",
          type: "select",
          options: ["flex", "grid", "block", "inline", "none"],
        },
        {
          key: "flexDirection",
          label: "Direction",
          type: "select",
          options: ["row", "column", "row-reverse", "column-reverse"],
        },
        {
          key: "justifyContent",
          label: "Justify",
          type: "select",
          options: [
            "flex-start",
            "center",
            "flex-end",
            "space-between",
            "space-around",
          ],
        },
        {
          key: "alignItems",
          label: "Align",
          type: "select",
          options: ["flex-start", "center", "flex-end", "stretch"],
        },
      ],
    },
    {
      id: "size",
      label: "Size",
      properties: [
        { key: "width", label: "Width", type: "text", placeholder: "auto" },
        { key: "height", label: "Height", type: "text", placeholder: "auto" },
        { key: "minWidth", label: "Min Width", type: "text" },
        { key: "maxWidth", label: "Max Width", type: "text" },
      ],
    },
    {
      id: "spacing",
      label: "Spacing",
      properties: [
        { key: "padding", label: "Padding", type: "text", placeholder: "0" },
        { key: "margin", label: "Margin", type: "text", placeholder: "0" },
        { key: "gap", label: "Gap", type: "text", placeholder: "0" },
      ],
    },
    {
      id: "typography",
      label: "Typography",
      properties: [
        { key: "fontSize", label: "Font Size", type: "text" },
        {
          key: "fontWeight",
          label: "Weight",
          type: "select",
          options: ["normal", "500", "600", "700"],
        },
        { key: "color", label: "Color", type: "color" },
        { key: "lineHeight", label: "Line Height", type: "text" },
      ],
    },
  ];

  return (
    <div className="divide-y divide-gray-700">
      {sections.map((section) => (
        <PropertySection
          key={section.id}
          title={section.label}
          isExpanded={expandedSections.includes(section.id)}
          onToggle={() =>
            setExpandedSections((prev) =>
              prev.includes(section.id)
                ? prev.filter((id) => id !== section.id)
                : [...prev, section.id]
            )
          }
        >
          <div className="space-y-2">
            {section.properties.map((prop: any) => (
              <PropertyInput
                key={prop.key}
                label={prop.label}
                type={prop.type}
                value={selectedElement.cssProperties?.[prop.key] ?? ""}
                onChange={(value) =>
                  updateCSSProperty(selectedElement.id, prop.key, value)
                }
                options={prop.options}
                placeholder={prop.placeholder}
              />
            ))}
          </div>
        </PropertySection>
      ))}
    </div>
  );
}
