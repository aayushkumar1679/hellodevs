"use client";

import React, { useState } from "react";
import { useDesignStore } from "@/state/useDesignStore";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Columns3,
  Copy,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";

export default function MultiSelectToolbar() {
  const selectedElements = useDesignStore((s) => s.selectedElements);
  const updateCSSBulk = useDesignStore((s) => s.updateCSSPropertiesBulk);
  const removeElement = useDesignStore((s) => s.removeElement);
  const [copied, setCopied] = useState(false);

  if (selectedElements.length < 2) return null;

  // Bulk operations
  const applyFlexRow = () => {
    updateCSSBulk(selectedElements, "display", "flex");
    updateCSSBulk(selectedElements, "flexDirection", "row");
    updateCSSBulk(selectedElements, "alignItems", "center");
  };

  const applyFlexColumn = () => {
    updateCSSBulk(selectedElements, "display", "flex");
    updateCSSBulk(selectedElements, "flexDirection", "column");
  };

  const applyGrid3 = () => {
    updateCSSBulk(
      selectedElements,
      "gridTemplateColumns",
      "repeat(3, minmax(0, 1fr))"
    );
  };

  const applyGap = (gap: string) => {
    updateCSSBulk(selectedElements, "gap", gap);
  };

  const applyAlignCenter = () => {
    updateCSSBulk(selectedElements, "textAlign", "center");
  };

  const applyAlignLeft = () => {
    updateCSSBulk(selectedElements, "textAlign", "left");
  };

  const applyAlignRight = () => {
    updateCSSBulk(selectedElements, "textAlign", "right");
  };

  const applyPadding = (padding: string) => {
    updateCSSBulk(selectedElements, "padding", padding);
  };

  const duplicateElements = () => {
    // This would need to be implemented in the store
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteSelected = () => {
    if (window.confirm(`Delete ${selectedElements.length} elements?`)) {
      selectedElements.forEach((id) => removeElement(id));
    }
  };

  return (
    <div className="px-3 py-2 border-b border-gray-800 bg-gradient-to-r from-gray-900/80 to-gray-850/80 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
          {selectedElements.length} Elements Selected
        </span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Layout buttons */}
        <button
          onClick={applyFlexRow}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
          title="Apply flex row layout"
        >
          <Columns3 className="w-3.5 h-3.5" />
          Flex Row
        </button>
        <button
          onClick={applyFlexColumn}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
          title="Apply flex column layout"
        >
          <Columns3 className="w-3.5 h-3.5 rotate-90" />
          Flex Column
        </button>

        {/* Spacing */}
        <button
          onClick={() => applyGap("8px")}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors"
          title="Set gap to 8px"
        >
          Gap: 8px
        </button>
        <button
          onClick={() => applyGap("16px")}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors"
          title="Set gap to 16px"
        >
          Gap: 16px
        </button>

        {/* Alignment */}
        <button
          onClick={applyAlignLeft}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors flex items-center justify-center"
          title="Align left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={applyAlignCenter}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors flex items-center justify-center"
          title="Align center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        {/* Padding */}
        <button
          onClick={() => applyPadding("12px")}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors"
          title="Apply 12px padding"
        >
          Pad: 12px
        </button>
        <button
          onClick={() => applyPadding("24px")}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors"
          title="Apply 24px padding"
        >
          Pad: 24px
        </button>

        {/* Destructive actions */}
        <button
          onClick={duplicateElements}
          className="px-2 py-1.5 rounded-sm bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
          title="Duplicate selected elements"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={deleteSelected}
          className="px-2 py-1.5 rounded-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
          title="Delete selected elements"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
