"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { generateNextJsProject } from "@/utils/exporter";
import { useSession, signOut } from "next-auth/react";
import { User as UserIcon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectCard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  componentCount: number;
}

export default function HomePage() {
  const { projects: projectsRecord, deleteProject, fetchProjects } = useCanvasStore();

  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [exportProjectId, setExportProjectId] = useState<string | null>(null);
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
      `${window.location.origin}/share/${projectId}`
    );
    setCopiedId(projectId);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_35%,#f8fafc_100%)] text-slate-950 selection:bg-sky-100 selection:text-sky-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-slate-950 text-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.8)] transition-transform group-hover:scale-105 group-hover:rotate-6">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Polyglot
              </p>
              <h1 className="text-sm font-bold text-slate-950">
                World-Class AI Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-400 hover:shadow-md"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="User Profile"
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full ring-2 ring-slate-100"
                    />
                  ) : (
                    <UserIcon size={20} className="text-slate-500" />
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.4)]"
                    >
                      <div className="px-4 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Account
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-slate-950">
                          {session.user?.name || "Member"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {session.user?.email}
                        </p>
                      </div>
                      <div className="h-px bg-slate-100 mx-1 mb-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                        className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-bold text-slate-600 transition hover:text-slate-950"
              >
                Log in
              </Link>
            )}

            <Link
              href="/builder/new"
              className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-[0_15px_30px_-12px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-8 py-14">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative group overflow-hidden rounded-[48px] border border-slate-200 bg-white/70 p-10 shadow-[0_50px_100px_-50px_rgba(15,23,42,0.5)] backdrop-blur-2xl transition-all hover:shadow-[0_60px_120px_-50px_rgba(15,23,42,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.06),transparent_40%)]" />
            <p className="relative inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700">
              <Sparkles className="h-4 w-4" />
              Next-Gen Design Studio
            </p>
            <h2 className="relative mt-8 max-w-3xl text-6xl font-black leading-[1.1] tracking-tighter text-slate-950 lg:text-7xl">
              Design like a pro, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">at AI speed.</span>
            </h2>
            <p className="relative mt-8 max-w-2xl text-lg leading-9 text-slate-600 font-medium">
              Combine OpenAI-assisted generations, a high-fidelity visual canvas,
              and direct production exports into a single deterministic workflow.
            </p>

            <div className="relative mt-10 flex flex-wrap gap-4">
              <Link
                href="/builder/new"
                className="group/btn inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-[15px] font-bold text-white shadow-[0_25px_50px_-15px_rgba(15,23,42,0.6)] transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
              >
                Launch Studio
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover/btn:translate-x-1" />
              </Link>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-[15px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md active:scale-95"
              >
                Recent Works
              </a>
            </div>

            <div className="relative mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[32px] border border-slate-100 bg-slate-50/70 p-5 shadow-inner transition-transform hover:scale-[1.02]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Projects
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-4xl font-black text-slate-950 tracking-tighter">
                    {stats.projects}
                  </p>
                  <p className="text-xs font-bold text-slate-400">active</p>
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-100 bg-slate-50/70 p-5 shadow-inner transition-transform hover:scale-[1.02]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Layers
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-4xl font-black text-slate-950 tracking-tighter">
                    {stats.layers}
                  </p>
                  <p className="text-xs font-bold text-slate-400">synced</p>
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-100 bg-slate-50/70 p-5 shadow-inner transition-transform hover:scale-[1.02]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Reliability
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-3xl font-black text-slate-950 tracking-tighter">
                    100%
                  </p>
                  <p className="text-xs font-bold text-slate-400">export</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[48px] border border-slate-200 bg-[radial-gradient(circle_at_top,#fff7ed,transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-10 shadow-[0_50px_100px_-50px_rgba(15,23,42,0.4)] transition-all hover:shadow-[0_60px_120px_-50px_rgba(15,23,42,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_40%)]" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Studio Elements
              </p>
              <div className="mt-8 space-y-5">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="group/card rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-[0_45px_100px_-50px_rgba(15,23,42,0.4)] transition-all duration-500 hover:-translate-y-2 hover:translate-x-1"
                    style={{
                      transform: `perspective(1200px) rotateX(12deg) rotateY(${
                        index === 0 ? -10 : index === 1 ? 8 : -6
                      }deg) translateZ(${index * 12}px)`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-950 tracking-tight">
                          {index === 0
                            ? "AI Section Prompt"
                            : index === 1
                            ? "3D Glass Layer"
                            : "Clean Export Zip"}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-slate-500 leading-relaxed">
                          {index === 0
                            ? "Structured landing sections in seconds."
                            : index === 1
                            ? "Premium depth with simple presets."
                            : "Next.js 14 production code packages."}
                        </p>
                      </div>
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-slate-950 text-white shadow-lg transition-transform group-hover/card:scale-110">
                        {index === 2 ? (
                          <Download className="h-5 w-5" />
                        ) : index === 1 ? (
                          <Layers3 className="h-5 w-5" />
                        ) : (
                          <Sparkles className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="space-y-6">
          <div className="flex flex-col gap-6 rounded-[40px] border border-slate-200 bg-white/75 px-10 py-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.25)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Your Studio
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Workspace
              </h3>
            </div>

            <div className="flex w-full items-center gap-4 md:max-w-md">
              <div className="group flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3.5 shadow-sm transition-all focus-within:border-slate-400 focus-within:shadow-md">
                <Search className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-slate-950" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects..."
                  className="w-full bg-transparent text-[15px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <Link
                href="/builder/new"
                className="inline-flex h-[54px] items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-[15px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:text-slate-950 active:scale-95"
              >
                <Plus className="h-4.5 w-4.5" />
                Create
              </Link>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[48px] border border-dashed border-slate-300 bg-white/40 px-10 py-32 text-center shadow-inner backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_70%)]" />
              <motion.div 
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.1)] transition-transform"
              >
                <FolderOpen className="h-10 w-10 text-slate-300" />
              </motion.div>
              <h3 className="relative mt-10 text-3xl font-black tracking-tight text-slate-950">
                {projects.length === 0 ? "A clean slate for your vision" : "No matches found in the studio"}
              </h3>
              <p className="relative mx-auto mt-5 max-w-sm text-[17px] leading-relaxed text-slate-500 font-medium">
                {projects.length === 0
                  ? "Start by architecting a new project. Our AI tools are ready to transform your prompts into high-fidelity layouts."
                  : "We couldn’t find any projects matching your search. Try adjusting your query or launch a fresh project."}
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative mt-12 inline-block"
              >
                <Link
                  href="/builder/new"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-10 py-5 text-[15px] font-bold text-white shadow-[0_25px_50px_-15px_rgba(15,23,42,0.5)] transition-all hover:bg-slate-800"
                >
                  <Plus className="h-5 w-5" />
                  Launch New Project
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative flex flex-col overflow-hidden rounded-[40px] border border-slate-200/60 bg-white/70 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.1)] backdrop-blur-md transition-all hover:-translate-y-2 hover:border-slate-400 hover:shadow-[0_48px_100px_-50px_rgba(15,23,42,0.4)]"
                >
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  <div className="relative h-48 overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#e0f2fe_45%,#ede9fe_100%)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />
                    <motion.div
                      whileHover={{ scale: 1.04, rotate: index % 2 === 0 ? -1 : 1 }}
                      className="absolute left-10 top-10 h-32 w-48 rounded-[36px] border border-white/90 bg-white/95 shadow-2xl transition-transform duration-700"
                      style={{
                        transform: `perspective(1200px) rotateX(20deg) rotateY(${
                          index % 2 === 0 ? -12 : 10
                        }deg)`,
                      }}
                    >
                       <div className="flex h-full flex-col p-5">
                         <div className="h-2.5 w-1/2 rounded-full bg-slate-100" />
                         <div className="mt-3 h-2 w-full rounded-full bg-slate-50" />
                         <div className="mt-2 h-2 w-4/5 rounded-full bg-slate-50" />
                         <div className="mt-auto flex justify-between">
                            <div className="h-6 w-6 rounded-lg bg-sky-50" />
                            <div className="h-6 w-6 rounded-lg bg-indigo-50" />
                         </div>
                       </div>
                    </motion.div>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="truncate text-2xl font-black tracking-[0.01em] text-slate-950 transition-colors group-hover:text-sky-600">
                          {project.name}
                        </h4>
                        <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                          Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-slate-900 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                        {project.componentCount} Layers
                      </span>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                      <Link
                        href={`/builder/${project.id}`}
                        className="flex-1 inline-flex h-13 items-center justify-center rounded-full border border-slate-950 bg-slate-950 text-[14px] font-bold text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.4)] transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
                      >
                        Open Studio
                      </Link>
                      <Link
                        href={`/builder/${project.id}/preview`}
                        className="flex h-13 w-13 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-400 hover:text-slate-950 hover:shadow-md active:scale-90"
                        title="Live Preview"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleCopyLink(project.id)}
                        className="flex h-13 w-13 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-400 hover:text-slate-950 hover:shadow-md active:scale-90"
                        title="Copy Share Link"
                      >
                        {copiedId === project.id ? (
                          <Check className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                      <button
                        onClick={() => setExportProjectId(project.id)}
                        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 transition-colors hover:text-slate-950"
                      >
                        <Download className="h-4 w-4" />
                        Production Export
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Permanently delete "${project.name}"?`)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600"
                        title="Delete project"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
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

        const files = generateNextJsProject(
          currentExportProject,
          currentExportProject.designElements
        );
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
