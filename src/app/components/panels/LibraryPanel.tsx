"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";

const COMPONENTS = [
  { name: "Navbar", icon: "📌", category: "Header" },
  { name: "Hero", icon: "🎯", category: "Header" },
  { name: "Features", icon: "✨", category: "Content" },
  { name: "Pricing", icon: "💰", category: "Content" },
  { name: "CTA", icon: "📢", category: "Call-to-Action" },
  { name: "Card", icon: "📇", category: "Content" },
  { name: "Button", icon: "🔘", category: "Form" },
  { name: "Form", icon: "📝", category: "Form" },
  { name: "ImageSection", icon: "🖼️", category: "Media" },
  { name: "Footer", icon: "📍", category: "Footer" },
];

export default function LibraryPanel() {
  const { addComponent } = useCanvasStore();
  const [search, setSearch] = useState("");

  const filtered = COMPONENTS.filter((comp) =>
    comp.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddComponent = (type: string) => {
    addComponent({
      id: `${type}-${Date.now()}`,
      type,
      props: {},
    });
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div>
        <h3 className="font-bold text-sm mb-3">Components</h3>
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            No components found
          </p>
        ) : (
          filtered.map((comp) => (
            <button
              key={comp.name}
              onClick={() => handleAddComponent(comp.name)}
              className="w-full text-left p-3 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 rounded transition border border-slate-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{comp.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {comp.name}
                    </div>
                    <div className="text-xs text-gray-500">{comp.category}</div>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-gray-600 transition">
                  +
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
