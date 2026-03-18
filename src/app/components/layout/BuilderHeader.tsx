"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Undo2,
  Redo2,
  Download,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  EyeOff,
  User as UserIcon,
  Loader2,
  Check,
  Save,
  PanelRight,
  LogOut,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import type { TechStack } from "@/utils/exportGenerators";
import { motion, AnimatePresence } from "framer-motion";
import { generateNextJsProject } from "@/utils/exporter";

interface BuilderHeaderProps {
  rightOpen?: boolean;
  onToggleRight?: () => void;
}

const BREAKPOINTS = [
  { id: "desktop" as const, icon: Monitor, label: "Desktop · 1440px" },
  { id: "tablet" as const, icon: Tablet, label: "Tablet · 768px" },
  { id: "mobile" as const, icon: Smartphone, label: "Mobile · 375px" },
];

export default function BuilderHeader({
  rightOpen,
  onToggleRight,
}: BuilderHeaderProps) {
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const saveProject = useProjectStore((s) => s.saveProject);
  const currentProject = useProjectStore((s) => s.currentProject);

  const { activeBreakpoint, setBreakpoint, previewEnabled, togglePreview } =
    useEditorStore();

  const { data: session } = useSession();
  const [showExport, setShowExport] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [didExport, setDidExport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    await saveProject?.().catch(() => {});
    setIsSaving(false);
    toast.success("Saved", { duration: 1500 });
  };

  const handleExport = async (format: TechStack) => {
    if (!currentProject || isExporting) return;
    setIsExporting(true);
    setShowExport(false);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: currentProject.id, format }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `${currentProject.name.replace(/[^a-z0-9]/gi, "_")}-export.zip`,
      });
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDidExport(true);
      setTimeout(() => setDidExport(false), 2200);
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeploy = async () => {
    if (!currentProject || isDeploying) return;
    setIsDeploying(true);
    setShowExport(false);
    try {
      const files = generateNextJsProject(currentProject);
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, projectName: currentProject.name }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Deployment failed");
      }

      const data = await res.json();
      setDeployUrl(data.deploymentUrl);
      toast.success("Deployment started!", {
        description: "Your site is being built on Vercel.",
        action: {
          label: "View",
          onClick: () => window.open(data.deploymentUrl, "_blank"),
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  /* ── Shared button base ─────────────────────────────────── */
  const iconBtn =
    "flex h-6 w-6 items-center justify-center rounded-md text-white/40 transition-all hover:bg-white/8 hover:text-white/80 active:scale-90";

  return (
    <header className="relative z-50 flex h-10 flex-shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0A0A0D] px-2 select-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(124,58,237,0.25),transparent_45%),radial-gradient(circle_at_right,rgba(56,189,248,0.22),transparent_50%)] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* ─── LEFT: brand + project name ─────────────────────── */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/"
          className="group relative flex h-7 w-7 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-[0_0_16px_rgba(124,110,248,0.45)] transition-transform hover:scale-105"
        >
          <span className="absolute inset-0 rounded-[10px] bg-white/10 opacity-0 transition group-hover:opacity-100" />
          <Sparkles className="h-3 w-3 text-white" />
        </Link>

        <div className="hidden min-w-0 sm:block">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25">
            Polyglot /
          </span>
          <span className="ml-1.5 max-w-[140px] truncate text-[11px] font-semibold text-white/70">
            {currentProject?.name ?? "Studio"}
          </span>
        </div>

        <div
          className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 animate-pulse-dot"
          title="Auto-saved"
        />
      </div>

      {/* ─── CENTER: breakpoint switcher ────────────────────── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-lg border border-white/[0.07] bg-white/[0.04] p-0.5">
        {BREAKPOINTS.map(({ id, icon: Icon, label }) => {
          const active = activeBreakpoint === id;
          return (
            <motion.button
              key={id}
              onClick={() => setBreakpoint(id)}
              title={label}
              whileTap={{ scale: 0.88 }}
              className={`flex h-6 w-7 items-center justify-center rounded-md transition-all duration-150 ${
                active
                  ? "bg-violet-600/90 text-white shadow-[0_2px_8px_rgba(124,110,248,0.35)]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Icon className="h-3 w-3" />
            </motion.button>
          );
        })}
      </div>

      {/* ─── RIGHT: actions ──────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <div className="flex items-center rounded-md border border-white/[0.07] bg-white/[0.03]">
          <button
            onClick={undo}
            className={`${iconBtn} rounded-l-md px-1.5`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3 w-3" />
          </button>
          <div className="h-3.5 w-px bg-white/8" />
          <button
            onClick={redo}
            className={`${iconBtn} rounded-r-md px-1.5`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3 w-3" />
          </button>
        </div>

        <button
          onClick={togglePreview}
          title={previewEnabled ? "Exit preview" : "Preview mode"}
          className={`flex h-6 items-center gap-1 rounded-md border px-2 text-[10px] font-semibold transition-all ${
            previewEnabled
              ? "border-sky-500/40 bg-sky-500/15 text-sky-400"
              : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white/70"
          }`}
        >
          {previewEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          <span className="hidden sm:inline">{previewEnabled ? "Live" : "Preview"}</span>
        </button>

        <button
          onClick={handleSave}
          className="flex h-6 items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.03] px-2 text-[10px] font-semibold text-white/40 transition-all hover:bg-white/6 hover:text-white/70"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          <span className="hidden sm:inline">Save</span>
        </button>

        <div className="relative">
          <motion.button
            onClick={() => setShowExport((v) => !v)}
            disabled={isExporting || isDeploying}
            whileTap={{ scale: 0.95 }}
            className="flex h-6 items-center gap-1 rounded-md bg-violet-600/90 px-2.5 text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(124,110,248,0.3)] transition-all hover:bg-violet-500 disabled:opacity-40"
          >
            <AnimatePresence mode="wait">
              {isExporting || isDeploying ? (
                <motion.span
                  key="spin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                </motion.span>
              ) : didExport ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Check className="h-3 w-3 text-emerald-300" />
                </motion.span>
              ) : (
                <motion.span
                  key="dl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Download className="h-3 w-3" />
                </motion.span>
              )}
            </AnimatePresence>
            {isExporting ? "Building…" : isDeploying ? "Deploying…" : didExport ? "Done!" : "Export"}
          </motion.button>

          <AnimatePresence>
            {showExport && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full z-[100] mt-1.5 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1A1A1E] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              >
                <p className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                  Choose format
                </p>
                {[
                  {
                    value: "react-tailwind" as TechStack,
                    label: "Next.js + Tailwind",
                    hint: "Production ready",
                  },
                  {
                    value: "html-css" as TechStack,
                    label: "HTML + CSS",
                    hint: "Zero deps",
                  },
                ].map(({ value, label, hint }) => (
                  <button
                    key={value}
                    onClick={() => handleExport(value)}
                    className="group flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition hover:bg-white/[0.06]"
                  >
                    <span className="text-[11px] font-semibold text-white/80 group-hover:text-white">
                      {label}
                    </span>
                    <span className="text-[10px] text-white/30">{hint}</span>
                  </button>
                ))}

                <div className="my-1 h-px bg-white/[0.06]" />

                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="group flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition hover:bg-violet-500/10"
                >
                  <div className="flex items-center gap-2">
                    <Rocket className="h-3 w-3 text-violet-400" />
                    <span className="text-[11px] font-bold text-violet-100 group-hover:text-white">
                      Deploy to Vercel
                    </span>
                  </div>
                  <span className="mt-0.5 text-[9px] text-white/30">Live production URL</span>
                </button>

                {deployUrl && (
                  <button
                    onClick={() => window.open(deployUrl, "_blank")}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 py-1.5 text-[10px] font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                  >
                    <Eye className="h-3 w-3" /> View Deployment
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onToggleRight}
          title="Toggle inspector"
          className={`${iconBtn} ${rightOpen ? "text-white/60" : ""}`}
        >
          <PanelRight className="h-3.5 w-3.5" />
        </button>

        <div className="relative ml-0.5">
          <button
            onClick={() => setShowUser((v) => !v)}
            className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-lg border border-white/[0.10] transition hover:border-white/20"
          >
            {session?.user?.image ? (
              <Image src={session.user.image} alt="User" width={24} height={24} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-3 w-3 text-white/40" />
            )}
          </button>

          <AnimatePresence>
            {showUser && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full z-[100] mt-1.5 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1A1A1E] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              >
                <div className="px-2.5 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Account</p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold text-white/80">{session?.user?.name ?? "Member"}</p>
                  <p className="truncate text-[10px] text-white/30">{session?.user?.email}</p>
                </div>
                <div className="mx-1 h-px bg-white/[0.06]" />
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-rose-400 transition hover:bg-rose-500/10"
                >
                  <LogOut className="h-3 w-3" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
