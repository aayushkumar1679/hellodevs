"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Eye, Code2 } from "lucide-react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { generateExport } from "@/utils/exportGenerators";

export default function SharePage() {
  const params = useParams() as { id: string };
  const project = useCanvasStore((state) => state.projects[params.id]);
  const designElements = useDesignStore((state) => state.elements);
  const [showCode, setShowCode] = useState(false);

  const exportedCode = useMemo(() => {
    if (!project) return "";
    return generateExport(project, "react-tailwind", designElements).code;
  }, [designElements, project]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Project not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Shared preview
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">
              {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCode((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              <Code2 className="h-4 w-4" />
              {showCode ? "Hide code" : "Show code"}
            </button>
            <Link
              href={`/builder/${project.id}/preview`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Eye className="h-4 w-4" />
              Open live preview
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row">
        <div className={`${showCode ? "lg:w-[58%]" : "w-full"} overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.3)]`}>
          <iframe
            title={`${project.name} preview`}
            src={`/builder/${project.id}/preview`}
            className="h-[78vh] w-full border-0"
          />
        </div>

        {showCode && (
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 lg:w-[42%]">
            <div className="border-b border-slate-800 px-5 py-4 text-sm font-semibold text-white">
              React export
            </div>
            <pre className="h-[78vh] overflow-auto p-5 text-[12px] leading-6 text-slate-100">
              <code>{exportedCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
