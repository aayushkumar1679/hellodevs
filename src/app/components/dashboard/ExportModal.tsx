"use client";

import React from "react";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { generateNextJsProject } from "@/utils/exporter";
import type { Project as CanvasProject } from "@/state/useCanvasStore";

interface ExportModalProps {
  project: CanvasProject;
  onClose: () => void;
}

export default function ExportModal({ project, onClose }: ExportModalProps) {
  const handleDownloadZip = async () => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9]/gi, "_")}-export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download project zip.");
    }
  };

  const files = generateNextJsProject(project, project.designElements);
  const mainPage = files.find((f) => f.name === "src/app/page.tsx") || files[0];
  const previewCode = mainPage.content;
  const previewFileName = mainPage.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_50px_100px_-60px_rgba(15,23,42,0.55)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Export
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">
              {project.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Preview the generated code and download the production Next.js package.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-6 py-4">
          <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            Next.js 14 + Tailwind CSS (Production Setup)
          </span>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-6 py-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="truncate text-sm text-slate-500">
              {previewFileName} (Main Component)
            </span>
            <button
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Download Production Zip
            </button>
          </div>

          <div className="flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950">
            <pre className="h-full overflow-auto p-5 text-[12px] leading-6 text-slate-100">
              <code>{previewCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
