"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useEditorStore } from "@/state/useEditorStore";
import { useDesignStore } from "@/state/useDesignStore";
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
import Link from "next/link";

export default function BuilderHeader() {
  const { undo, redo, currentProject } = useCanvasStore();

  const {
    activeBreakpoint,
    setBreakpoint,
    previewEnabled,
    togglePreview,
    breakpoints,
  } = useEditorStore();

  const setDesignBreakpoint = useDesignStore((s) => s.setActiveBreakpoint);

  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  const deviceIcons = {
    mobile: <Smartphone size={14} />,
    tablet: <Tablet size={14} />,
    desktop: <Monitor size={14} />,
  };

  const currentDevice = breakpoints[activeBreakpoint];

  const handleExport = (format: "react" | "tailwind" | "css") => {
    console.log("Exporting as", format);
    setShowExport(false);
  };

  return (
    <>
      <header className="h-11 flex items-center justify-between px-4 border-b border-white/5 bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)] backdrop-blur">
        {/* Left: Project */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              Project
            </span>
            <h1 className="text-sm font-semibold text-gray-100 truncate max-w-[240px]">
              {currentProject?.name || "Untitled Project"}
            </h1>
          </div>

          {currentProject?.id && (
            <Link
              href={`/builder/${currentProject.id}/preview`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition"
                title="Preview in new tab"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </Link>
          )}
        </div>

        {/* Center: Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Undo"
          >
            <Undo2 size={14} />
          </button>

          <button
            onClick={redo}
            className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Redo"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          {/* Device selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowDeviceMenu((v) => !v)}
              className="h-7 px-2 flex items-center gap-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition text-xs"
            >
              {deviceIcons[activeBreakpoint]}
              <span className="hidden md:inline">{currentDevice.label}</span>
            </button>

            {showDeviceMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl border border-white/10 bg-[#020617] shadow-xl backdrop-blur z-50 overflow-hidden">
                {Object.keys(breakpoints).map((bp) => (
                  <button
                    key={bp}
                    onClick={() => {
                      setBreakpoint(bp as any);
                      setDesignBreakpoint(bp as any);
                      setShowDeviceMenu(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition ${
                      activeBreakpoint === bp
                        ? "bg-blue-500/15 text-blue-300"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {deviceIcons[bp as keyof typeof deviceIcons]}
                    {breakpoints[bp as keyof typeof breakpoints].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview toggle */}
          <button
            onClick={togglePreview}
            className={`h-7 w-7 flex items-center justify-center rounded-md transition ${
              previewEnabled
                ? "bg-white/15 text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
            title="Toggle Preview"
          >
            {previewEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExport((v) => !v)}
              className="h-7 px-2 flex items-center gap-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition text-xs"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExport && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl border border-white/10 bg-[#020617] shadow-xl backdrop-blur z-50 overflow-hidden">
                {["react", "tailwind", "css"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      handleExport(type as "react" | "tailwind" | "css")
                    }
                    className="w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition"
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <button
            onClick={() => setShowHelp((v) => !v)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Help"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </header>

      {/* Device Indicator */}
      {previewEnabled && (
        <div className="h-8 flex items-center justify-center gap-2 text-xs border-b border-white/5 bg-[#020617] text-gray-400">
          {deviceIcons[activeBreakpoint]}
          <span>
            Viewing{" "}
            <span className="text-gray-200 font-medium">
              {currentDevice.label}
            </span>
          </span>
        </div>
      )}
    </>
  );
}
