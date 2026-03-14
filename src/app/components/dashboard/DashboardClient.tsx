"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, FolderOpen, Eye, Check, Copy, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useProjectStore, type PolyglotProject as CanvasProject } from "@/state/useProjectStore";
import ExportModal from "./ExportModal"; // We will create this

interface InitialProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  components: Record<string, unknown>;
  designElements: Record<string, unknown>;
  componentCount?: number;
}

export default function DashboardClient({ initialProjects }: { initialProjects: InitialProject[] }) {
  const { projects: storeProjects, fetchProjects, deleteProject } = useProjectStore();
  const [search, setSearch] = useState("");
  const [exportProjectId, setExportProjectId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  useEffect(() => {
    fetchProjects().then(() => setIsStoreLoaded(true));
  }, [fetchProjects]);

  // Merge initial projects with store projects to ensure immediate rendering
  const displayProjects = useMemo(() => {
    const dataSource = isStoreLoaded ? Object.values(storeProjects) : initialProjects;
    return dataSource.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt ?? new Date().toISOString(),
      updatedAt: p.updatedAt,
      componentCount: 'componentCount' in p ? p.componentCount : Object.keys(p.components || {}).length,
    })).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [isStoreLoaded, storeProjects, initialProjects]);

  const filteredProjects = useMemo(() => {
    return displayProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [displayProjects, search]);

  const handleCopyLink = async (projectId: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${projectId}`);
    setCopiedId(projectId);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const currentExportProject = exportProjectId 
    ? (storeProjects[exportProjectId] || initialProjects.find(p => p.id === exportProjectId))
    : null;

  return (
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
              onChange={(e) => setSearch(e.target.value)}
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
            animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.1)] transition-transform"
          >
            <FolderOpen className="h-10 w-10 text-slate-300" />
          </motion.div>
          <h3 className="relative mt-10 text-3xl font-black tracking-tight text-slate-950">
            {displayProjects.length === 0 ? "A clean slate for your vision" : "No matches found in the studio"}
          </h3>
          <p className="relative mx-auto mt-5 max-w-sm text-[17px] leading-relaxed text-slate-500 font-medium">
            {displayProjects.length === 0
              ? "Start by architecting a new project. Our AI tools are ready to transform your prompts into high-fidelity layouts."
              : "We couldn’t find any projects matching your search. Try adjusting your query or launch a fresh project."}
          </p>
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
                    transform: `perspective(1200px) rotateX(20deg) rotateY(${index % 2 === 0 ? -12 : 10}deg)`,
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
                    {copiedId === project.id ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
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

      {currentExportProject && (
        <ExportModal 
          project={currentExportProject as CanvasProject} 
          onClose={() => setExportProjectId(null)} 
        />
      )}
    </section>
  );
}
