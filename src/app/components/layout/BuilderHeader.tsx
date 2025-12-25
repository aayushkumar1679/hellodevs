"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useEditorStore } from "@/state/useEditorStore";
import { useDesignStore } from "@/state/useDesignStore"; // ✅ ADD
import {
  Undo2,
  Redo2,
  Download,
  HelpCircle,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  EyeOff,
} from "lucide-react";

export default function BuilderHeader() {
  const { undo, redo, currentProject } = useCanvasStore();

  /* Editor (global UI state) */
  const {
    activeBreakpoint,
    setBreakpoint,
    previewEnabled,
    togglePreview,
    breakpoints,
  } = useEditorStore();

  /* ✅ Design store (CSS resolution) */
  const setDesignBreakpoint = useDesignStore((s) => s.setActiveBreakpoint);

  /* Local UI state */
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  const deviceIcons = {
    mobile: <Smartphone size={16} />,
    tablet: <Tablet size={16} />,
    desktop: <Monitor size={16} />,
  };

  const currentDevice = breakpoints[activeBreakpoint];

  const handleExport = (format: "react" | "tailwind" | "css") => {
    console.log("Exporting as", format);
    setShowExport(false);
  };

  return (
    <>
      <header className="flex items-center justify-between h-10 bg-gradient-to-b from-gray-900 to-gray-850 border-b border-gray-800 px-4">
        {/* Project name */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-100 truncate max-w-xs">
            {currentProject?.name || "Untitled Project"}
          </h1>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors text-gray-300 hover:text-gray-100"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors text-gray-300 hover:text-gray-100"
          >
            <Redo2 size={16} />
          </button>
          <div className="w-px h-4 bg-gray-700/50 mx-2" />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              className="p-1.5 hover:bg-gray-800/80 rounded-sm flex items-center gap-1.5 text-gray-300 hover:text-gray-100"
            >
              {deviceIcons[activeBreakpoint]}
              <span className="text-xs hidden md:inline">
                {currentDevice.label}
              </span>
            </button>

            {showDeviceMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-gradient-to-r from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-lg shadow-lg z-50">
                {Object.keys(breakpoints).map((bp) => (
                  <button
                    key={bp}
                    onClick={() => {
                      setBreakpoint(bp as any); // UI
                      setDesignBreakpoint(bp as any); // ✅ CSS
                      setShowDeviceMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs flex items-center gap-2
                      ${
                        activeBreakpoint === bp
                          ? "bg-blue-400/20 text-blue-300"
                          : "text-gray-200 hover:bg-gray-700/60"
                      }`}
                  >
                    {deviceIcons[bp as keyof typeof deviceIcons]}
                    {breakpoints[bp as keyof typeof breakpoints].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Toggle */}
          <button
            onClick={togglePreview}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm text-gray-300 hover:text-gray-100"
          >
            {previewEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <div className="w-px h-4 bg-gray-700/50 mx-2 hidden sm:block" />

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="p-1.5 hover:bg-gray-800/80 rounded-sm flex items-center gap-1 text-gray-300 hover:text-gray-100"
            >
              <Download size={16} />
              <span className="text-xs hidden sm:inline">Export</span>
            </button>

            {showExport && (
              <div className="absolute right-0 mt-2 bg-gradient-to-r from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-lg shadow-lg z-50">
                {["react", "tailwind", "css"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      handleExport(type as "react" | "tailwind" | "css")
                    }
                    className="block w-full px-3 py-2 text-xs text-gray-200 hover:bg-gray-700/60"
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm text-gray-300 hover:text-gray-100"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* Device Indicator */}
      {previewEnabled && (
        <div className="h-8 bg-gray-800/50 border-b border-gray-700/50 px-4 flex items-center justify-center text-xs text-gray-400">
          <div className="flex items-center gap-2">
            {deviceIcons[activeBreakpoint]}
            <span>
              Viewing:{" "}
              <span className="text-gray-300 font-medium">
                {currentDevice.label}
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
