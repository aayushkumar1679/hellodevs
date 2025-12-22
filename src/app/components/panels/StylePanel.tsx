"use client";

import React, { useState } from "react";
import { useDesignStore } from "@/state/useDesignStore";
import { useCanvasStore } from "@/state/useCanvasStore";
import { ChevronDown, X } from "lucide-react";

type SectionId =
  | "layout"
  | "spacing"
  | "colors"
  | "typography"
  | "effects"
  | "position";

export default function StylePanel() {
  const selectedElements = useDesignStore((state) => state.selectedElements);
  const elements = useDesignStore((state) => state.elements);
  const updateCSSProperty = useDesignStore((state) => state.updateCSSProperty);
  const updateCSSPropertiesBulk = useDesignStore(
    (state) => state.updateCSSPropertiesBulk
  );
  const { currentProject } = useCanvasStore();

  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(["layout", "spacing"])
  );

  const toggleSection = (sectionId: SectionId) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(sectionId)) {
      newSections.delete(sectionId);
    } else {
      newSections.add(sectionId);
    }
    setExpandedSections(newSections);
  };

  if (selectedElements.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-xs text-center bg-gradient-to-b from-gray-900 to-gray-850 border-t border-gray-800 rounded">
        <p className="font-semibold mb-1">No Elements Selected</p>
        <p>Click elements on canvas to select them</p>
        <p className="text-[10px] mt-2">💡 Ctrl+Click to select multiple</p>
      </div>
    );
  }

  const selectedIds = selectedElements;
  const primaryId = selectedIds[0];
  const element = elements[primaryId];

  if (!element) return null;

  const css = element.cssProperties || {};
  const isMultiSelect = selectedIds.length > 1;

  const handlePropertyChange = (property: string, value: any) => {
    if (isMultiSelect) {
      updateCSSPropertiesBulk(selectedIds, property, value);
    } else {
      updateCSSProperty(primaryId, property, value);
    }
  };

  const getElementInfo = (id: string) => {
    const comp = currentProject?.components[id];
    return comp?.type || "Unknown";
  };

  const Section = ({
    id,
    title,
    children,
  }: {
    id: SectionId;
    title: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);
    return (
      <div className="p-2 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between group cursor-pointer"
        >
          <h3 className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
            {title}
          </h3>
          <ChevronDown
            className={`w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
        {isExpanded && <div className="space-y-2 mt-2">{children}</div>}
      </div>
    );
  };

  return (
    <div className="p-3 space-y-4 text-gray-100 bg-gradient-to-b from-gray-900 to-gray-850 border-t border-gray-800 overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Multi-select info */}
      {isMultiSelect && (
        <div className="mb-3 px-3 py-2 rounded bg-blue-500/15 border border-blue-500/30">
          <p className="text-[10px] font-semibold text-blue-200">
            ✓ {selectedIds.length} Elements Selected
          </p>
          <div className="text-[9px] text-blue-300/70 mt-1 space-y-0.5">
            {selectedIds.slice(0, 3).map((id) => (
              <div key={id} className="flex items-center gap-1">
                <span>•</span>
                <span>{getElementInfo(id)}</span>
              </div>
            ))}
            {selectedIds.length > 3 && (
              <div className="text-[9px] text-blue-300/50">
                +{selectedIds.length - 3} more
              </div>
            )}
          </div>
          <p className="text-[9px] text-blue-300 mt-2">
            Changes apply to all selected elements
          </p>
        </div>
      )}

      {/* Single element info */}
      {!isMultiSelect && (
        <div className="px-2 py-1.5 rounded bg-gray-800/50 border border-gray-700">
          <p className="text-[9px] text-gray-400">Element Type</p>
          <p className="text-[11px] font-semibold text-gray-200">
            {getElementInfo(primaryId)}
          </p>
        </div>
      )}

      {/* Layout Section */}
      <Section id="layout" title="Layout">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Display
          </label>
          <select
            value={css.display || "block"}
            onChange={(e) => handlePropertyChange("display", e.target.value)}
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          >
            <option value="block">Block</option>
            <option value="inline-block">Inline Block</option>
            <option value="inline">Inline</option>
            <option value="flex">Flex</option>
            <option value="grid">Grid</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* Flex options */}
        {css.display === "flex" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">
                  Direction
                </label>
                <select
                  value={css.flexDirection || "row"}
                  onChange={(e) =>
                    handlePropertyChange("flexDirection", e.target.value)
                  }
                  className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                >
                  <option value="row">Row</option>
                  <option value="column">Column</option>
                  <option value="row-reverse">Row Reverse</option>
                  <option value="column-reverse">Col Reverse</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">
                  Gap
                </label>
                <input
                  type="text"
                  value={css.gap || ""}
                  onChange={(e) => handlePropertyChange("gap", e.target.value)}
                  placeholder="16px"
                  className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">
                  Align Items
                </label>
                <select
                  value={css.alignItems || "stretch"}
                  onChange={(e) =>
                    handlePropertyChange("alignItems", e.target.value)
                  }
                  className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                >
                  <option value="stretch">Stretch</option>
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">
                  Justify
                </label>
                <select
                  value={css.justifyContent || "flex-start"}
                  onChange={(e) =>
                    handlePropertyChange("justifyContent", e.target.value)
                  }
                  className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                >
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                  <option value="space-between">Between</option>
                  <option value="space-around">Around</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Width
            </label>
            <input
              type="text"
              value={css.width || ""}
              onChange={(e) => handlePropertyChange("width", e.target.value)}
              placeholder="auto"
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Height
            </label>
            <input
              type="text"
              value={css.height || ""}
              onChange={(e) => handlePropertyChange("height", e.target.value)}
              placeholder="auto"
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
        </div>
      </Section>

      {/* Spacing Section */}
      <Section id="spacing" title="Spacing">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Padding
          </label>
          <input
            type="text"
            value={css.padding || ""}
            onChange={(e) => handlePropertyChange("padding", e.target.value)}
            placeholder="10px"
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Margin</label>
          <input
            type="text"
            value={css.margin || ""}
            onChange={(e) => handlePropertyChange("margin", e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          />
        </div>
      </Section>

      {/* Colors Section */}
      <Section id="colors" title="Colors">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Background
          </label>
          <div className="flex gap-1">
            <input
              type="color"
              value={css.backgroundColor || "#ffffff"}
              onChange={(e) =>
                handlePropertyChange("backgroundColor", e.target.value)
              }
              className="w-8 h-7 rounded cursor-pointer bg-gray-800 border border-gray-700"
            />
            <input
              type="text"
              value={css.backgroundColor || ""}
              onChange={(e) =>
                handlePropertyChange("backgroundColor", e.target.value)
              }
              className="flex-1 px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Text Color
          </label>
          <div className="flex gap-1">
            <input
              type="color"
              value={css.color || "#000000"}
              onChange={(e) => handlePropertyChange("color", e.target.value)}
              className="w-8 h-7 rounded cursor-pointer bg-gray-800 border border-gray-700"
            />
            <input
              type="text"
              value={css.color || ""}
              onChange={(e) => handlePropertyChange("color", e.target.value)}
              className="flex-1 px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
        </div>
      </Section>

      {/* Typography Section */}
      <Section id="typography" title="Typography">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Font Size
            </label>
            <input
              type="text"
              value={css.fontSize || ""}
              onChange={(e) => handlePropertyChange("fontSize", e.target.value)}
              placeholder="16px"
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Font Weight
            </label>
            <select
              value={css.fontWeight || "400"}
              onChange={(e) =>
                handlePropertyChange("fontWeight", e.target.value)
              }
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Line Height
          </label>
          <input
            type="text"
            value={css.lineHeight || ""}
            onChange={(e) => handlePropertyChange("lineHeight", e.target.value)}
            placeholder="1.5"
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Text Align
          </label>
          <select
            value={css.textAlign || "left"}
            onChange={(e) => handlePropertyChange("textAlign", e.target.value)}
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      </Section>

      {/* Effects Section */}
      <Section id="effects" title="Effects">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Border Radius
          </label>
          <input
            type="text"
            value={css.borderRadius || ""}
            onChange={(e) =>
              handlePropertyChange("borderRadius", e.target.value)
            }
            placeholder="0px"
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Border</label>
          <input
            type="text"
            value={css.border || ""}
            onChange={(e) => handlePropertyChange("border", e.target.value)}
            placeholder="1px solid #000"
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Box Shadow
          </label>
          <input
            type="text"
            value={css.boxShadow || ""}
            onChange={(e) => handlePropertyChange("boxShadow", e.target.value)}
            placeholder="0 4px 6px rgba(0,0,0,0.1)"
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Opacity
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={css.opacity || 1}
              onChange={(e) =>
                handlePropertyChange("opacity", parseFloat(e.target.value))
              }
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400"
            />
            <span className="text-[10px] text-gray-400 min-w-[30px] text-right">
              {((css.opacity || 1) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </Section>

      {/* Position Section */}
      <Section id="position" title="Position">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">
            Position
          </label>
          <select
            value={css.position || "static"}
            onChange={(e) => handlePropertyChange("position", e.target.value)}
            className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
          >
            <option value="static">Static</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Top</label>
            <input
              type="text"
              value={css.top || ""}
              onChange={(e) => handlePropertyChange("top", e.target.value)}
              placeholder="auto"
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Right
            </label>
            <input
              type="text"
              value={css.right || ""}
              onChange={(e) => handlePropertyChange("right", e.target.value)}
              placeholder="auto"
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-sm text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
