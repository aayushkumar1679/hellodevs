"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProjectSurface from "@/components/project/ProjectSurface";
import { useProjectStore } from "@/state/useProjectStore";
import { getProjectRootIds } from "@/utils/projectModel";

export default function CanvasPreviewPage() {
  const params = useParams() as { id: string };
  const {
    projects,
    currentProject,
    currentProjectId,
    setCurrentProject,
    fetchProject,
  } = useProjectStore();
  const [isLoading, setIsLoading] = React.useState(true);

  const project =
    currentProjectId === params.id ? currentProject : projects[params.id] ?? null;

  React.useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      setIsLoading(true);

      try {
        if (projects[params.id]) {
          setCurrentProject(params.id);
        }

        await fetchProject(params.id);
      } catch (error) {
        console.error("Failed to load preview project", error);
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
  }, [fetchProject, params.id, projects, setCurrentProject]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Loading preview...
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

  const hasContent = getProjectRootIds(project).length > 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Preview
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {project.name}
            </h1>
          </div>

          <Link
            href={`/builder/${params.id}`}
            className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to builder
          </Link>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_32px_80px_-50px_rgba(15,23,42,0.45)]">
          {hasContent ? (
            <ProjectSurface
              project={project}
              className="space-y-4"
            />
          ) : (
            <div className="flex min-h-[60vh] items-center justify-center text-center text-slate-500">
              No components added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
