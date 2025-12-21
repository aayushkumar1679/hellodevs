"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import {
  Menu,
  Undo2,
  Redo2,
  Download,
  HelpCircle,
  Settings,
} from "lucide-react";

export default function BuilderHeader() {
  const { undo, redo, currentProject } = useCanvasStore();
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleExport = (format: "react" | "tailwind" | "css") => {
    console.log("Exporting as", format);
    setShowExport(false);
  };

  return (
    <header className="flex items-center justify-between h-10 bg-gray-900 border-b border-gray-700 px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white truncate max-w-xs">
          {currentProject?.name || "Untitled Project"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} className="text-gray-300" />
        </button>
        <button
          onClick={redo}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} className="text-gray-300" />
        </button>
        <div className="w-px h-4 bg-gray-700 mx-2" />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors flex items-center gap-1"
            title="Export Code"
          >
            <Download size={16} className="text-gray-300" />
            <span className="text-xs text-gray-300 hidden sm:inline">
              Export
            </span>
          </button>
          {showExport && (
            <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-max">
              <button
                onClick={() => handleExport("react")}
                className="block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 first:rounded-t last:rounded-b"
              >
                React JSX
              </button>
              <button
                onClick={() => handleExport("tailwind")}
                className="block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 first:rounded-t last:rounded-b"
              >
                Tailwind CSS
              </button>
              <button
                onClick={() => handleExport("css")}
                className="block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 first:rounded-t last:rounded-b"
              >
                CSS Modules
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Help (Ctrl+?)"
        >
          <HelpCircle size={16} className="text-gray-300" />
        </button>
      </div>
    </header>
  );
}
