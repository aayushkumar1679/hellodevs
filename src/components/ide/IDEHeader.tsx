"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  PenTool,
  Columns,
  Code2,
  MonitorPlay,
  GitCompare,
  Undo2,
  Redo2,
  Save,
  Download,
  Check,
  Loader2,
  User as UserIcon,
  LogOut,
  Rocket,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import type { TechStack } from "@/utils/exportGenerators";
import { motion, AnimatePresence } from "framer-motion";
import { generateNextJsProject } from "@/utils/exporter";
import DeployDialog from "@/components/ide/DeployDialog";

/* ── View Modes ─────────────────────────────────── */
const VIEW_MODES = [
  { id: "design"  as const, icon: PenTool,     label: "Design"  },
  { id: "split"   as const, icon: Columns,     label: "Split"   },
  { id: "code"    as const, icon: Code2,       label: "Code"    },
  { id: "preview" as const, icon: MonitorPlay, label: "Preview" },
  { id: "diff"    as const, icon: GitCompare,  label: "Diff"    },
];

const BREAKPOINTS = [
  { id: "desktop" as const, icon: Monitor,     label: "Desktop · 1440px" },
  { id: "tablet"  as const, icon: Tablet,      label: "Tablet · 768px"   },
  { id: "mobile"  as const, icon: Smartphone,  label: "Mobile · 375px"   },
];

interface IDEHeaderProps {
  rightOpen?: boolean;
  onToggleRight?: () => void;
}

/* ─────────────────────────────────────────────────
   IDEHeader
   Height: 36px  |  bg: --bg-void
   Left   : logo + project breadcrumb
   Center : view-mode pills
   Right  : breakpoints + undo/redo + save + export + avatar
───────────────────────────────────────────────── */
export default function IDEHeader({ rightOpen, onToggleRight }: IDEHeaderProps) {
  const undo          = useProjectStore((s) => s.undo);
  const redo          = useProjectStore((s) => s.redo);
  const saveProject   = useProjectStore((s) => s.saveProject);
  const currentProject = useProjectStore((s) => s.currentProject);

  const { viewMode, setViewMode, activeBreakpoint, setBreakpoint } = useEditorStore();

  const { data: session } = useSession();
  const [showExport,  setShowExport]  = useState(false);
  const [showUser,    setShowUser]    = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [didExport,   setDidExport]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl,   setDeployUrl]   = useState<string | null>(null);

  /* ── Handlers ─────────────────────────────────── */
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
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), {
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
      const res   = await fetch("/api/deploy", {
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
        action: { label: "View", onClick: () => window.open(data.deploymentUrl, "_blank") },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  /* ── Shared button styles ─────────────────────── */
  const iconBtn =
    "flex h-6 w-6 items-center justify-center rounded transition-all duration-[120ms]" +
    " text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-overlay)] active:scale-90";

  return (
    <header
      className="relative z-50 flex flex-shrink-0 items-center justify-between select-none"
      style={{
        height: "var(--header-h)",
        background: "var(--bg-void)",
        borderBottom: "1px solid var(--border-dim)",
        paddingLeft: 8,
        paddingRight: 8,
      }}
    >
      {/* ─── LEFT: logo + breadcrumb ─────────────── */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/"
          className="flex h-6 w-6 items-center justify-center rounded transition-all hover:bg-[var(--bg-overlay)]"
          title="Polyglot IDE"
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
        </Link>

        <div className="hidden min-w-0 items-center gap-1 sm:flex">
          <span
            className="font-bold uppercase tracking-[0.2em]"
            style={{ fontSize: 9, color: "var(--text-3)" }}
          >
            Polyglot
          </span>
          <span style={{ color: "var(--border-soft)" }}>/</span>
          <span
            className="max-w-[140px] truncate font-medium"
            style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}
          >
            {currentProject?.name ?? "studio"}
          </span>
        </div>
      </div>

      {/* ─── CENTER: view-mode pills ─────────────── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
        {/* View modes */}
        <div
          className="flex items-center gap-0.5 rounded p-0.5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
        >
          {VIEW_MODES.map(({ id, icon: Icon, label }) => {
            const active = viewMode === id;
            return (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                title={label}
                className="flex items-center gap-1 rounded transition-all duration-[120ms] active:scale-90"
                style={{
                  height: 22,
                  padding: "0 6px",
                  background: active ? "var(--accent-dim)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-3)",
                  fontSize: 11,
                  fontFamily: "var(--font-ui)",
                }}
              >
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Breakpoints */}
        <div
          className="flex items-center gap-0.5 rounded p-0.5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)" }}
        >
          {BREAKPOINTS.map(({ id, icon: Icon, label }) => {
            const active = activeBreakpoint === id;
            return (
              <button
                key={id}
                onClick={() => setBreakpoint(id)}
                title={label}
                className="flex h-[22px] w-[26px] items-center justify-center rounded transition-all duration-[120ms] active:scale-90"
                style={{
                  background: active ? "var(--bg-overlay)" : "transparent",
                  color: active ? "var(--text-1)" : "var(--text-3)",
                }}
              >
                <Icon className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── RIGHT: actions ──────────────────────── */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <div
          className="flex items-center rounded"
          style={{ border: "1px solid var(--border-dim)", background: "var(--bg-surface)" }}
        >
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            className={`${iconBtn} rounded-l px-1.5`}
          >
            <Undo2 className="h-3 w-3" />
          </button>
          <div style={{ width: 1, height: 14, background: "var(--border-dim)" }} />
          <button
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            className={`${iconBtn} rounded-r px-1.5`}
          >
            <Redo2 className="h-3 w-3" />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          title="Save (Ctrl+S)"
          className="flex h-6 items-center gap-1 rounded px-2 text-[10px] font-medium transition-all duration-[120ms] hover:bg-[var(--bg-overlay)] active:scale-90"
          style={{
            border: "1px solid var(--border-dim)",
            background: "var(--bg-surface)",
            color: "var(--text-3)",
          }}
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Export */}
        <div className="relative">
          <motion.button
            onClick={() => setShowExport((v) => !v)}
            disabled={isExporting || isDeploying}
            whileTap={{ scale: 0.95 }}
            className="flex h-6 items-center gap-1 rounded px-2.5 text-[10px] font-bold text-white transition-all disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            <AnimatePresence mode="wait">
              {isExporting || isDeploying ? (
                <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="h-3 w-3 animate-spin" />
                </motion.span>
              ) : didExport ? (
                <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
                  <Check className="h-3 w-3" style={{ color: "var(--accent-5)" }} />
                </motion.span>
              ) : (
                <motion.span key="dl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                className="absolute right-0 top-full z-[100] mt-1.5 w-44 overflow-hidden rounded p-1"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-soft)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                }}
              >
                <p
                  className="px-2.5 py-1 font-bold uppercase tracking-widest"
                  style={{ fontSize: 9, color: "var(--text-3)" }}
                >
                  Choose format
                </p>

                {[
                  { value: "react-tailwind" as TechStack, label: "Next.js + Tailwind", hint: "Production ready" },
                  { value: "html-css"        as TechStack, label: "HTML + CSS",         hint: "Zero deps"        },
                ].map(({ value, label, hint }) => (
                  <button
                    key={value}
                    onClick={() => handleExport(value)}
                    className="flex w-full flex-col rounded px-2.5 py-2 text-left transition-all hover:bg-[var(--bg-overlay)]"
                  >
                    <span className="text-[11px] font-semibold" style={{ color: "var(--text-2)" }}>{label}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{hint}</span>
                  </button>
                ))}

                <div style={{ height: 1, background: "var(--border-dim)", margin: "4px 0" }} />

                <DeployDialog>
                  <button className="flex w-full flex-col rounded px-2.5 py-2 text-left transition-all hover:bg-[var(--bg-overlay)]">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-3 w-3" style={{ color: "var(--accent)" }} />
                      <span className="text-[11px] font-bold" style={{ color: "var(--text-1)" }}>
                        Deploy to Vercel
                      </span>
                    </div>
                    <span className="mt-0.5 text-[9px]" style={{ color: "var(--text-3)" }}>
                      Live production URL
                    </span>
                  </button>
                </DeployDialog>

                {deployUrl && (
                  <button
                    onClick={() => window.open(deployUrl, "_blank")}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded py-1.5 text-[10px] font-bold transition-all"
                    style={{
                      background: "var(--accent-2-dim)",
                      color: "var(--accent-2)",
                    }}
                  >
                    <Eye className="h-3 w-3" /> View Deployment
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="relative ml-0.5">
          <button
            onClick={() => setShowUser((v) => !v)}
            className="flex h-6 w-6 items-center justify-center overflow-hidden rounded transition-all"
            style={{ border: "1px solid var(--border-soft)" }}
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="User"
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-3 w-3" style={{ color: "var(--text-3)" }} />
            )}
          </button>

          <AnimatePresence>
            {showUser && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full z-[100] mt-1.5 w-48 overflow-hidden rounded p-1"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-soft)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                }}
              >
                <div className="px-2.5 py-2">
                  <p className="font-bold uppercase tracking-widest" style={{ fontSize: 9, color: "var(--text-3)" }}>
                    Account
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold" style={{ color: "var(--text-2)" }}>
                    {session?.user?.name ?? "Member"}
                  </p>
                  <p className="truncate text-[10px]" style={{ color: "var(--text-3)" }}>
                    {session?.user?.email}
                  </p>
                </div>
                <div style={{ height: 1, background: "var(--border-dim)", margin: "0 4px" }} />
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-[11px] font-semibold transition-all hover:bg-[var(--bg-overlay)]"
                  style={{ color: "var(--accent-3)" }}
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
