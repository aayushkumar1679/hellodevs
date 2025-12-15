"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import {
  generateReactCode,
  generateHTMLCode,
  downloadCode,
} from "@/utils/codeGenerator";

type ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { componentTree } = useCanvasStore();
  const [format, setFormat] = useState<"react" | "html">("react");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const code =
    format === "react"
      ? generateReactCode(componentTree)
      : generateHTMLCode(componentTree);

  const handleDownload = () => {
    const filename = format === "react" ? "page.tsx" : "index.html";
    downloadCode(code, filename);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Export Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Format Selector */}
        <div className="border-b border-gray-200 p-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="react"
              checked={format === "react"}
              onChange={(e) => setFormat(e.target.value as any)}
            />
            <span className="font-medium">React (Next.js)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="html"
              checked={format === "html"}
              onChange={(e) => setFormat(e.target.value as any)}
            />
            <span className="font-medium">HTML</span>
          </label>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-auto bg-slate-900 p-4">
          <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
            <code>{code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-2 justify-end">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Download File
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
