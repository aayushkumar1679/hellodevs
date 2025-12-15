"use client";

import React from "react";
import { useCanvasStore } from "@/state/useCanvasStore";

export default function PropertyPanel() {
  const { componentTree, selectedComponentId, updateComponent } =
    useCanvasStore();

  const selectedComponent = componentTree.find(
    (c) => c.id === selectedComponentId
  );

  if (!selectedComponent) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        Select a component to edit properties
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, { [key]: value });
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="font-bold text-sm mb-2">
          Component: {selectedComponent.type}
        </h3>
        <p className="text-xs text-gray-500">ID: {selectedComponent.id}</p>
      </div>

      {selectedComponent.type === "Navbar" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <input
              type="text"
              value={selectedComponent.props?.logo || ""}
              onChange={(e) => handlePropChange("logo", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Variant</label>
            <select
              value={selectedComponent.props?.variant || "light"}
              onChange={(e) => handlePropChange("variant", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option>light</option>
              <option>dark</option>
            </select>
          </div>
        </>
      )}

      {selectedComponent.type === "Hero" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={selectedComponent.props?.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={selectedComponent.props?.subtitle || ""}
              onChange={(e) => handlePropChange("subtitle", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={selectedComponent.props?.buttonText || ""}
              onChange={(e) => handlePropChange("buttonText", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        </>
      )}

      {selectedComponent.type === "Card" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={selectedComponent.props?.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={selectedComponent.props?.description || ""}
              onChange={(e) => handlePropChange("description", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Badge</label>
            <input
              type="text"
              value={selectedComponent.props?.badge || ""}
              onChange={(e) => handlePropChange("badge", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Optional"
            />
          </div>
        </>
      )}

      {selectedComponent.type === "Button" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <input
              type="text"
              value={selectedComponent.props?.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Variant</label>
            <select
              value={selectedComponent.props?.variant || "primary"}
              onChange={(e) => handlePropChange("variant", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option>primary</option>
              <option>secondary</option>
              <option>outline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <select
              value={selectedComponent.props?.size || "md"}
              onChange={(e) => handlePropChange("size", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option>sm</option>
              <option>md</option>
              <option>lg</option>
            </select>
          </div>
        </>
      )}

      {selectedComponent.type === "Features" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={selectedComponent.props?.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Columns</label>
            <input
              type="number"
              value={selectedComponent.props?.columns || 3}
              onChange={(e) =>
                handlePropChange("columns", parseInt(e.target.value))
              }
              className="w-full border rounded px-2 py-1 text-sm"
              min="1"
              max="4"
            />
          </div>
        </>
      )}

      {selectedComponent.type === "CTA" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={selectedComponent.props?.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={selectedComponent.props?.subtitle || ""}
              onChange={(e) => handlePropChange("subtitle", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        </>
      )}
    </div>
  );
}
