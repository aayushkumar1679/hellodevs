"use client";

import React, { useMemo, useState } from "react";
import { X, Download, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { useCanvasStore } from "../../../state/useCanvasStore";
import { useDesignStore } from "../../../state/useDesignStore";
import { generateNextJsProject } from "../../../utils/exporter";
import type { TechStack } from "../../../utils/exportGenerators";
import { toast } from "sonner";

type ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const currentProject = useCanvasStore((state) => state.currentProject);
  const elements = useDesignStore((state) => state.elements);
  const [format, setFormat] = useState<TechStack>("react-tailwind");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const result = useMemo(() => {
    if (!currentProject) return null;
    const files = generateNextJsProject(currentProject, elements);
    const mainPage = files.find(f => f.name === "src/app/page.tsx") || files[0];
    return {
      fileName: mainPage.name,
      code: mainPage.content
    };
  }, [currentProject, elements]);

  if (!isOpen || !currentProject || !result) return null;

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: currentProject.id }),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentProject.name.replace(/[^a-z0-9]/gi, "_")}-export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download project zip.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md">
      <div className="group relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[40px] border border-white/10 bg-white shadow-[0_50px_100px_-40px_rgba(0,0,0,0.5)]">
        {/* Animated Glow Border */}
        <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
              Launch Package
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {currentProject.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:border-slate-300 hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tech Spec Bar */}
          <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/50 px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                Next.js 14 + Tailwind CSS
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-500">
              Production-ready project structure
            </span>
          </div>

          {/* Code Preview Header */}
          <div className="flex items-center justify-between gap-4 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">
                {result.fileName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="group relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="relative inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting ? "Bundling..." : "Download Production Zip"}
              </button>
            </div>
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-hidden border-t border-slate-200 bg-[#0f1117]">
             <div className="h-full overflow-auto custom-scrollbar">
                <pre className="p-8 text-[13px] leading-relaxed font-mono">
                  <code className="text-slate-300 block">
                    {result.code}
                  </code>
                </pre>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
