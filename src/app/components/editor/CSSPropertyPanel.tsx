"use client";

import React, { useState } from "react";
import { useDesignStore, CSSProperties } from "@/state/useDesignStore";

// Type definitions
interface PropertyDef {
  key: string;
  label: string;
  type: "input" | "select" | "color" | "range";
  placeholder?: string;
  options?: string[];
  min?: string;
  max?: string;
  step?: string;
}

interface CategoryDef {
  label: string;
  properties: PropertyDef[];
}

const CSS_CATEGORIES: Record<string, CategoryDef> = {
  layout: {
    label: "Layout",
    properties: [
      {
        key: "display",
        label: "Display",
        type: "select",
        options: ["block", "inline", "inline-block", "flex", "grid", "none"],
      },
      {
        key: "flexDirection",
        label: "Flex Direction",
        type: "select",
        options: ["row", "column", "row-reverse", "column-reverse"],
      },
      {
        key: "justifyContent",
        label: "Justify Content",
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
        label: "Align Items",
        type: "select",
        options: ["flex-start", "center", "flex-end", "stretch"],
      },
      { key: "gap", label: "Gap", type: "input", placeholder: "0px" },
    ],
  },
  size: {
    label: "Size",
    properties: [
      { key: "width", label: "Width", type: "input", placeholder: "auto" },
      { key: "height", label: "Height", type: "input", placeholder: "auto" },
      {
        key: "minWidth",
        label: "Min Width",
        type: "input",
        placeholder: "auto",
      },
      {
        key: "maxWidth",
        label: "Max Width",
        type: "input",
        placeholder: "none",
      },
    ],
  },
  spacing: {
    label: "Spacing",
    properties: [
      { key: "margin", label: "Margin", type: "input", placeholder: "0px" },
      { key: "padding", label: "Padding", type: "input", placeholder: "0px" },
      {
        key: "marginTop",
        label: "Margin Top",
        type: "input",
        placeholder: "0px",
      },
      {
        key: "paddingTop",
        label: "Padding Top",
        type: "input",
        placeholder: "0px",
      },
    ],
  },
  typography: {
    label: "Typography",
    properties: [
      {
        key: "fontSize",
        label: "Font Size",
        type: "input",
        placeholder: "16px",
      },
      {
        key: "fontWeight",
        label: "Font Weight",
        type: "select",
        options: ["400", "500", "600", "700", "800"],
      },
      {
        key: "color",
        label: "Text Color",
        type: "color",
      },
    ],
  },
  colors: {
    label: "Colors & Background",
    properties: [
      {
        key: "backgroundColor",
        label: "Background Color",
        type: "color",
      },
      {
        key: "opacity",
        label: "Opacity",
        type: "range",
        min: "0",
        max: "1",
        step: "0.1",
      },
    ],
  },
  borders: {
    label: "Borders",
    properties: [
      {
        key: "borderRadius",
        label: "Border Radius",
        type: "input",
        placeholder: "0px",
      },
      {
        key: "border",
        label: "Border",
        type: "input",
        placeholder: "1px solid #000",
      },
    ],
  },
  flex: {
    label: "Grid & Flex",
    properties: [
      {
        key: "gridTemplateColumns",
        label: "Grid Columns",
        type: "input",
        placeholder: "repeat(12, 1fr)",
      },
      {
        key: "gridTemplateRows",
        label: "Grid Rows",
        type: "input",
        placeholder: "auto",
      },
      { key: "gridGap", label: "Grid Gap", type: "input", placeholder: "16px" },
      {
        key: "flexWrap",
        label: "Flex Wrap",
        type: "select",
        options: ["nowrap", "wrap", "wrap-reverse"],
      },
    ],
  },
};

export default function CSSPropertyPanel() {
  const { selectedElements, elements, updateCSSProperty } = useDesignStore();
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    layout: true,
    size: false,
    spacing: false,
    typography: false,
    colors: false,
    borders: false,
  });

  console.log("CSSPropertyPanel - selectedElements:", selectedElements);
  console.log("CSSPropertyPanel - elements:", elements);

  if (selectedElements.length === 0) {
    return (
      <div className="p-8 text-center h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-lg font-bold text-gray-700 mb-2">
          No Element Selected
        </p>
        <p className="text-sm text-gray-500 max-w-xs">
          Click on any component in the canvas to edit its CSS properties
        </p>
      </div>
    );
  }

  const selectedElement = elements[selectedElements[0]];

  if (!selectedElement) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Element not found in store</p>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handlePropertyChange = (property: string, value: any) => {
    console.log("Updating property:", property, "=", value);
    updateCSSProperty(
      selectedElements[0],
      property as keyof CSSProperties,
      value || undefined
    );
  };

  return (
    <div className="space-y-2 p-4 overflow-y-auto h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 pb-3 mb-4 rounded-lg p-3 shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          Selected Element
        </p>
        <p className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
          {selectedElements[0]}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          <span className="font-semibold">Type:</span> {selectedElement.type}
        </p>
      </div>

      {/* CSS Categories */}
      <div className="space-y-2">
        {Object.entries(CSS_CATEGORIES).map(([categoryKey, category]) => (
          <div
            key={categoryKey}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => toggleCategory(categoryKey)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition font-semibold text-sm text-left"
            >
              <span className="text-gray-700">{category.label}</span>
              <span
                className={`transform transition text-gray-600 ${
                  expandedCategories[categoryKey] ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </button>

            {expandedCategories[categoryKey] && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                {category.properties.map((prop) => {
                  const rawValue =
                    selectedElement.cssProperties?.base?.[
                      prop.key as keyof CSSProperties
                    ];
                  const currentValue =
                    typeof rawValue === "string" || typeof rawValue === "number"
                      ? rawValue
                      : "";

                  return (
                    <div key={prop.key} className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase">
                        {prop.label}
                      </label>

                      {prop.type === "input" && (
                        <input
                          type="text"
                          value={currentValue || ""}
                          onChange={(e) =>
                            handlePropertyChange(prop.key, e.target.value)
                          }
                          placeholder={prop.placeholder || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                        />
                      )}

                      {prop.type === "select" && (
                        <select
                          value={currentValue || ""}
                          onChange={(e) =>
                            handlePropertyChange(prop.key, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                        >
                          <option value="">Select...</option>
                          {prop.options?.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {prop.type === "color" && (
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={currentValue || "#000000"}
                            onChange={(e) =>
                              handlePropertyChange(prop.key, e.target.value)
                            }
                            className="h-10 w-14 cursor-pointer border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={currentValue || ""}
                            onChange={(e) =>
                              handlePropertyChange(prop.key, e.target.value)
                            }
                            placeholder="#000000"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      )}

                      {prop.type === "range" && (
                        <div className="flex gap-3 items-center">
                          <input
                            type="range"
                            min={prop.min || "0"}
                            max={prop.max || "1"}
                            step={prop.step || "0.1"}
                            value={currentValue || "1"}
                            onChange={(e) =>
                              handlePropertyChange(
                                prop.key,
                                parseFloat(e.target.value)
                              )
                            }
                            className="flex-1 h-2 bg-gray-200 rounded-lg accent-blue-500"
                          />
                          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded w-12 text-center">
                            {parseFloat(String(currentValue || "1")).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <p className="font-semibold">✨ CSS Updates</p>
        <p className="mt-1">
          Changes are applied instantly. Check browser console for debug info.
        </p>
      </div>
    </div>
  );
}
