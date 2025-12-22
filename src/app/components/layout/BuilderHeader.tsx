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
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  EyeOff,
} from "lucide-react";

type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceOption {
  id: DeviceType;
  label: string;
  icon: React.ReactNode;
  width: number;
  height: string;
}

export default function BuilderHeader() {
  const { undo, redo, currentProject } = useCanvasStore();
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("desktop");
  const [showPreview, setShowPreview] = useState(true);

  const devices: DeviceOption[] = [
    {
      id: "mobile",
      label: "Mobile (375px)",
      icon: <Smartphone size={16} />,
      width: 375,
      height: "h-full",
    },
    {
      id: "tablet",
      label: "Tablet (768px)",
      icon: <Tablet size={16} />,
      width: 768,
      height: "h-full",
    },
    {
      id: "desktop",
      label: "Desktop (1440px)",
      icon: <Monitor size={16} />,
      width: 1440,
      height: "h-full",
    },
  ];

  const handleExport = (format: "react" | "tailwind" | "css") => {
    console.log("Exporting as", format);
    setShowExport(false);
  };

  const currentDeviceInfo = devices.find((d) => d.id === selectedDevice);

  return (
    <>
      <header className="flex items-center justify-between h-10 bg-gradient-to-b from-gray-900 to-gray-850 border-b border-gray-800 px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-100 truncate max-w-xs">
            {currentProject?.name || "Untitled Project"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors text-gray-300 hover:text-gray-100"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors text-gray-300 hover:text-gray-100"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
          <div className="w-px h-4 bg-gray-700/50 mx-2" />
        </div>

        <div className="flex items-center gap-2">
          {/* Device View Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors flex items-center gap-1.5 text-gray-300 hover:text-gray-100"
              title="Device View"
            >
              {currentDeviceInfo?.icon}
              <span className="text-xs text-gray-300 hidden md:inline">
                {currentDeviceInfo?.label}
              </span>
            </button>
            {showDeviceMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-gradient-to-r from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-lg shadow-lg z-50 min-w-max backdrop-blur-sm">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => {
                      setSelectedDevice(device.id);
                      setShowDeviceMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      selectedDevice === device.id
                        ? "bg-blue-400/20 text-blue-300"
                        : "text-gray-200 hover:bg-gray-700/60"
                    }`}
                  >
                    {device.icon}
                    {device.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors text-gray-300 hover:text-gray-100"
            title={showPreview ? "Hide Preview" : "Show Preview"}
          >
            {showPreview ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <div className="w-px h-4 bg-gray-700/50 mx-2 hidden sm:block" />

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors flex items-center gap-1 text-gray-300 hover:text-gray-100"
              title="Export Code"
            >
              <Download size={16} />
              <span className="text-xs text-gray-300 hidden sm:inline">
                Export
              </span>
            </button>
            {showExport && (
              <div className="absolute right-0 mt-2 bg-gradient-to-r from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-lg shadow-lg z-50 min-w-max backdrop-blur-sm">
                <button
                  onClick={() => handleExport("react")}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-700/60 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  React JSX
                </button>
                <button
                  onClick={() => handleExport("tailwind")}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-700/60 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  Tailwind CSS
                </button>
                <button
                  onClick={() => handleExport("css")}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-700/60 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  CSS Modules
                </button>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 hover:bg-gray-800/80 rounded-sm transition-colors text-gray-300 hover:text-gray-100"
            title="Help (Ctrl+?)"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* Device View Indicator */}
      {showPreview && (
        <div className="h-8 bg-gray-800/50 border-b border-gray-700/50 px-4 flex items-center justify-center text-xs text-gray-400">
          <div className="flex items-center gap-2">
            {currentDeviceInfo?.icon}
            <span>
              Viewing:{" "}
              <span className="text-gray-300 font-medium">
                {currentDeviceInfo?.label}
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
