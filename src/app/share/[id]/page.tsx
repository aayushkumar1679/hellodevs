"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Eye, Code2 } from "lucide-react";
import type { PolyglotProject } from "@/state/useProjectStore";
import ProjectSurface from "@/components/project/ProjectSurface";
import { generateExport } from "@/utils/exportGenerators";
import { normalizeProjectData } from "@/utils/projectModel";

export default function SharePage() {
  const params = useParams() as { id: string };
  const [project, setProject] = useState<PolyglotProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);

  React.useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/share/${params.id}`);
        if (!response.ok) {
          if (mounted) {
            setProject(null);
          }
          return;
        }

        const data = (await response.json()) as PolyglotProject;
        if (mounted) {
          setProject(normalizeProjectData(data));
        }
      } catch (error) {
        console.error("Failed to load shared project", error);
        if (mounted) {
          setProject(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProject();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  const exportedCode = useMemo(() => {
    if (!project) return "";
    return generateExport(project, "react-tailwind").code;
  }, [project]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Loading shared project...
        </div>
      </div>
    );
  }

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
              Builder preview
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row">
        <div
          className={`${
            showCode ? "lg:w-[58%]" : "w-full"
          } overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.3)]`}
        >
          <ProjectSurface
            project={project}
            className="space-y-4"
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
