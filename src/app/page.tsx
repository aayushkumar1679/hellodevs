"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Eye,
  FolderOpen,
  Layers3,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useCanvasStore, type Project as CanvasProject } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { generateExport, type TechStack } from "@/utils/exportGenerators";
import { generateNextJsProject } from "@/utils/exporter";
import { useSession, signOut } from "next-auth/react";
import { User as UserIcon, LogOut } from "lucide-react";

interface ProjectCard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  componentCount: number;
}

export default function HomePage() {
  const { projects: projectsRecord, deleteProject, fetchProjects } = useCanvasStore();
  const designElements = useDesignStore((state) => state.elements);

  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [exportProjectId, setExportProjectId] = useState<string | null>(null);
  const [exportTech, setExportTech] = useState<TechStack>("react-tailwind");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  React.useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session, fetchProjects]);


  const projects = useMemo<ProjectCard[]>(
    () =>
      Object.values(projectsRecord)
        .map((project: CanvasProject) => ({
          id: project.id,
          name: project.name,
          createdAt: project.createdAt ?? new Date().toISOString(),
          updatedAt: project.updatedAt,
          componentCount: Object.keys(project.components || {}).length,
        }))
        .sort(
          (left, right) =>
            new Date(right.updatedAt || right.createdAt).getTime() -
            new Date(left.updatedAt || left.createdAt).getTime()
        ),
    [projectsRecord]
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.name.toLowerCase().includes(search.toLowerCase())
      ),
    [projects, search]
  );

  const stats = useMemo(
    () => ({
      projects: projects.length,
      layers: projects.reduce((sum, project) => sum + project.componentCount, 0),
      lastUpdated:
        projects[0]?.updatedAt || projects[0]?.createdAt || new Date().toISOString(),
    }),
    [projects]
  );

  const currentExportProject =
    exportProjectId != null ? projectsRecord[exportProjectId] : null;

  const handleCopyLink = async (projectId: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/builder/${projectId}/preview`
    );
    setCopiedId(projectId);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_35%,#f8fafc_100%)] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_24px_40px_-24px_rgba(15,23,42,0.9)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                Polyglot
              </p>
              <h1 className="text-sm font-semibold text-slate-950">
                AI + visual web builder
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="User"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserIcon size={18} className="text-slate-500" />
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Account
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                        {session.user?.name || "User"}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="h-px bg-slate-100 mx-2" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/builder/new"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[40px] border border-slate-200 bg-white/88 p-8 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              World-class building flow
            </p>
            <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-slate-950">
              Prompt, sculpt, and export launch-ready websites in one studio.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Polyglot combines OpenAI-assisted page generation, a visual canvas,
              and deterministic export so ideas turn into polished frontends fast.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/builder/new"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open the studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Browse projects
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Projects
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {stats.projects}
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Layers
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {stats.layers}
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Last update
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {new Date(stats.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-[radial-gradient(circle_at_top,#fef3c7,transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_34%)]" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                3D-ready visual system
              </p>
              <div className="mt-6 space-y-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-[0_32px_50px_-35px_rgba(15,23,42,0.45)]"
                    style={{
                      transform: `perspective(1100px) rotateX(15deg) rotateY(${
                        index === 0 ? -8 : index === 1 ? 5 : -4
                      }deg) translateZ(${index * 8}px)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {index === 0
                            ? "Prompt-generated hero"
                            : index === 1
                            ? "Glassmorphism card"
                            : "Export package"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {index === 0
                            ? "OpenAI creates structured sections."
                            : index === 1
                            ? "Use depth presets in the inspector."
                            : "React and HTML exports stay deterministic."}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        {index === 2 ? (
                          <Download className="h-4 w-4" />
                        ) : index === 1 ? (
                          <Layers3 className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="space-y-5">
          <div className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white/85 px-6 py-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.25)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                Workspace
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">
                Recent projects
              </h3>
            </div>

            <div className="flex w-full items-center gap-3 md:max-w-md">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <Link
                href="/builder/new"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                <FolderOpen className="h-4 w-4" />
                Create
              </Link>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-[36px] border border-dashed border-slate-300 bg-white/80 px-8 py-16 text-center shadow-inner">
              <p className="text-xl font-semibold text-slate-950">
                {projects.length === 0 ? "No projects yet" : "No matches found"}
              </p>
              <p className="mt-3 text-base text-slate-500">
                {projects.length === 0
                  ? "Create a project and use the AI panel to generate your first page."
                  : "Try a different search query or create a fresh project."}
              </p>
              <Link
                href="/builder/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create project
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.3)] transition hover:-translate-y-1 hover:border-slate-300"
                >
                  <div className="relative h-36 overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#e0f2fe_45%,#fef3c7_100%)]">
                    <div
                      className="absolute left-6 top-6 h-24 w-32 rounded-[28px] border border-white/80 bg-white/90"
                      style={{
                        transform: `perspective(1000px) rotateX(18deg) rotateY(${
                          index % 2 === 0 ? -10 : 8
                        }deg)`,
                      }}
                    />
                    <div
                      className="absolute bottom-6 right-6 h-20 w-28 rounded-[24px] border border-white/80 bg-white/80"
                      style={{
                        transform: `perspective(900px) rotateX(12deg) rotateY(${
                          index % 2 === 0 ? 8 : -8
                        }deg)`,
                      }}
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-lg font-semibold text-slate-950">
                          {project.name}
                        </h4>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          {project.componentCount} layers
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Updated{" "}
                        {new Date(
                          project.updatedAt || project.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      <Link
                        href={`/builder/${project.id}`}
                        className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Open
                      </Link>
                      <Link
                        href={`/builder/${project.id}/preview`}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleCopyLink(project.id)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                        title="Copy preview link"
                      >
                        {copiedId === project.id ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setExportProjectId(project.id);
                          setExportTech("react-tailwind");
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                        title="Export"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 transition hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete project
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {currentExportProject && (() => {
        const handleDownloadZip = async () => {
          if (!currentExportProject) return;
          try {
            const response = await fetch("/api/export", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: currentExportProject.id }),
            });
            if (!response.ok) throw new Error("Export failed");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${currentExportProject.name.replace(/[^a-z0-9]/gi, "_")}-export.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } catch (e) {
            console.error(e);
            alert("Failed to download project zip.");
          }
        };

        const files = generateNextJsProject(currentExportProject as any, designElements);
        const mainPage = files.find(f => f.name === "src/app/page.tsx") || files[0];
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
                    {currentExportProject.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Preview the generated code and download the production Next.js package.
                  </p>
                </div>
                <button
                  onClick={() => setExportProjectId(null)}
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
      })()}
    </div>
  );
}
