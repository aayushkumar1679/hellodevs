"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  FolderOpen,
  Eye,
  Check,
  Copy,
  Download,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useProjectStore,
  type PolyglotProject as CanvasProject,
} from "@/state/useProjectStore";
import ExportModal from "./ExportModal";

interface InitialProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  components: Record<string, unknown>;
  designElements: Record<string, unknown>;
  componentCount?: number;
}

/* Pastel gradient pairs for project card thumbnails */
const CARD_GRADIENTS = [
  "from-violet-500/20 to-indigo-600/20",
  "from-sky-500/20 to-cyan-600/20",
  "from-rose-500/20 to-pink-600/20",
  "from-amber-500/20 to-orange-600/20",
  "from-emerald-500/20 to-teal-600/20",
  "from-purple-500/20 to-violet-600/20",
];

const ACCENT_DOTS = [
  "bg-violet-400",
  "bg-sky-400",
  "bg-rose-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-purple-400",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardClient({
  initialProjects,
}: {
  initialProjects: InitialProject[];
}) {
  const {
    projects: storeProjects,
    fetchProjects,
    deleteProject,
  } = useProjectStore();
  const [search, setSearch] = useState("");
  const [exportProjectId, setExportProjectId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  useEffect(() => {
    fetchProjects().then(() => setIsStoreLoaded(true));
  }, [fetchProjects]);

  const displayProjects = useMemo(() => {
    const src = isStoreLoaded ? Object.values(storeProjects) : initialProjects;
    return src
      .map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt ?? new Date().toISOString(),
        updatedAt: p.updatedAt,
        componentCount:
          "componentCount" in p
            ? (p.componentCount as number)
            : Object.keys(p.components || {}).length,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      );
  }, [isStoreLoaded, storeProjects, initialProjects]);

  const filtered = useMemo(
    () =>
      displayProjects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [displayProjects, search],
  );

  const handleCopy = async (id: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/share/${id}`,
    );
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const currentExportProject = exportProjectId
    ? (storeProjects[exportProjectId] ??
      (initialProjects.find(
        (p) => p.id === exportProjectId,
      ) as unknown as CanvasProject))
    : null;

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">
            Your workspace
          </p>
          <h2 className="text-[15px] font-bold text-white/70">
            Projects
            <span className="ml-2 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-white/30">
              {displayProjects.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 transition focus-within:border-white/15 focus-within:bg-white/[0.06]">
            <Search className="h-3 w-3 flex-shrink-0 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-36 bg-transparent text-[11px] font-medium text-white/60 outline-none placeholder:text-white/20"
            />
          </div>

          <Link
            href="/builder/new"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600/90 px-3 text-[11px] font-bold text-white shadow-[0_2px_10px_rgba(124,110,248,0.25)] transition hover:bg-violet-500"
          >
            <Plus className="h-3 w-3" />
            New
          </Link>
        </div>
      </div>

      {/* ── Grid / Empty state ────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] py-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white/20"
            >
              <FolderOpen className="h-6 w-6" />
            </motion.div>
            <p className="text-[13px] font-semibold text-white/40">
              {displayProjects.length === 0
                ? "No projects yet"
                : "No results for that search"}
            </p>
            <p className="mt-1 text-[11px] text-white/20">
              {displayProjects.length === 0
                ? "Create your first project with the AI Studio"
                : "Try a different search term"}
            </p>
            {displayProjects.length === 0 && (
              <Link
                href="/builder/new"
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-violet-500"
              >
                <Plus className="h-3 w-3" /> Create project
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((project, idx) => {
              const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
              const dot = ACCENT_DOTS[idx % ACCENT_DOTS.length];

              return (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0E0E12] transition-all hover:border-white/10 hover:bg-[#13131A]"
                >
                  {/* ── Thumbnail preview ───────────────────── */}
                  <div
                    className={`relative h-36 bg-gradient-to-br ${gradient} overflow-hidden`}
                  >
                    {/* Abstract wireframe skeleton */}
                    <div className="absolute inset-0 p-4 opacity-30">
                      <div className="h-3 w-1/3 rounded bg-white/30 mb-2" />
                      <div className="h-8 w-full rounded bg-white/10 mb-2" />
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="h-10 rounded bg-white/10" />
                        <div className="h-10 rounded bg-white/10" />
                        <div className="h-10 rounded bg-white/10" />
                      </div>
                    </div>

                    {/* Open button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/builder/${project.id}`}
                        className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-900 transition hover:bg-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Studio
                      </Link>
                    </div>
                  </div>

                  {/* ── Card body ───────────────────────────── */}
                  <div className="flex flex-1 flex-col px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                          <h3 className="truncate text-[13px] font-bold text-white/80">
                            {project.name}
                          </h3>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/25">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDate(project.updatedAt || project.createdAt)}
                          <span className="text-white/15">·</span>
                          <span>{project.componentCount} layers</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Actions ─────────────────────────────── */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <Link
                        href={`/builder/${project.id}`}
                        className="flex-1 inline-flex h-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[10px] font-bold text-white/50 transition hover:border-white/15 hover:text-white/70"
                      >
                        Open
                      </Link>
                      <Link
                        href={`/builder/${project.id}/preview`}
                        title="Preview"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/30 transition hover:border-white/15 hover:text-white/60"
                      >
                        <Eye className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => handleCopy(project.id)}
                        title="Copy share link"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/30 transition hover:border-white/15 hover:text-white/60"
                      >
                        {copiedId === project.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => setExportProjectId(project.id)}
                        title="Export"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/30 transition hover:border-white/15 hover:text-white/60"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${project.name}"? This cannot be undone.`,
                            )
                          ) {
                            deleteProject(project.id);
                          }
                        }}
                        title="Delete"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/25 transition hover:border-rose-500/20 hover:bg-rose-500/8 hover:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export modal */}
      {currentExportProject && (
        <ExportModal
          project={currentExportProject}
          onClose={() => setExportProjectId(null)}
        />
      )}
    </div>
  );
}
