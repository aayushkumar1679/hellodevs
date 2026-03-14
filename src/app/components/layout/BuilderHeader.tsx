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
  LogOut,
  User as UserIcon,
  Loader2,
  Check,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import type { TechStack } from "@/utils/exportGenerators";
import { motion, AnimatePresence } from "framer-motion";

export default function BuilderHeader() {
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const saveProject = useProjectStore((state) => state.saveProject);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setDesignBreakpoint = () => {}; // Replaced by useEditorStore hook

  const {
    activeBreakpoint,
    setBreakpoint,
    previewEnabled,
    togglePreview,
    breakpoints,
  } = useEditorStore();

  const { data: session } = useSession();
  const [showExport, setShowExport] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const currentDevice = breakpoints[activeBreakpoint];

  const handleExport = async (format: TechStack) => {
    if (!currentProject || isExporting) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: currentProject.id, format }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentProject.name.replace(/[^a-z0-9]/gi, "_")}-export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export project. Please try again.");
    } finally {
      setIsExporting(false);
      setShowExport(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-12 border-b border-slate-200/60 bg-white/90 backdrop-blur-2xl">
        <div className="flex h-full items-center justify-between px-3 gap-2">
          {/* ── Logo + Project Name ── */}
          <div className="flex min-w-0 items-center gap-2.5">
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white shadow-[0_8px_20px_-6px_rgba(15,23,42,0.7)] transition-transform group-hover:scale-105 group-hover:rotate-3">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">
                  Polyglot
                </p>
                <p className="truncate max-w-[120px] text-[12px] font-black tracking-tight text-slate-950 leading-tight group-hover:text-sky-600 transition-colors">
                  {currentProject?.name || "Studio"}
                </p>
              </div>
            </Link>
          </div>

          {/* ── Device Breakpoints (Center) ── */}
          <div className="flex flex-1 items-center justify-center gap-1">
            {(["desktop", "tablet", "mobile"] as const).map((d) => (
              <motion.button
                key={d}
                onClick={() => { setBreakpoint(d); }}
                className={`flex h-7 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                  activeBreakpoint === d
                    ? "bg-slate-950 text-white shadow-[0_6px_16px_-4px_rgba(15,23,42,0.5)]"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.9 }}
                title={d.charAt(0).toUpperCase() + d.slice(1)}
              >
                {d === "desktop" && <Monitor size={13} />}
                {d === "tablet" && <Tablet size={13} />}
                {d === "mobile" && <Smartphone size={13} />}
              </motion.button>
            ))}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5">
            {/* Undo / Redo */}
            <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white/60 p-0.5">
              <button
                onClick={undo}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={12} />
              </button>
              <button
                onClick={redo}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 size={12} />
              </button>
            </div>

            {/* Preview Toggle */}
            <button
              onClick={togglePreview}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 ${
                previewEnabled
                  ? "border-sky-400 bg-sky-500 text-white shadow-[0_4px_12px_-2px_rgba(14,165,233,0.45)]"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
              title="Toggle Preview"
            >
              {previewEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>

            {/* Save */}
            <button
              onClick={saveProject}
              className="group inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              title="Save Project Manually"
            >
              <Save size={13} className="text-slate-400 group-hover:text-slate-700" />
              Save
            </button>

            {/* Export */}
            <div className="relative">
              <motion.button
                onClick={() => setShowExport((v) => !v)}
                disabled={isExporting}
                className="group inline-flex h-7 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-[11px] font-bold text-white transition-all hover:bg-slate-800 hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.4)] disabled:opacity-50"
                whileTap={{ scale: 0.96 }}
              >
                <AnimatePresence mode="wait">
                  {isExporting ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Loader2 size={12} className="animate-spin" />
                    </motion.span>
                  ) : exportSuccess ? (
                    <motion.span key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
                      <Check size={12} className="text-emerald-400" />
                    </motion.span>
                  ) : (
                    <motion.span key="download" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Download size={12} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {isExporting ? "Exporting..." : exportSuccess ? "Done!" : "Export"}
              </motion.button>

              <AnimatePresence>
                {showExport && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)]"
                  >
                    <p className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Export Format</p>
                    {[
                      ["react-tailwind", "Next.js + Tailwind", "Production ready"],
                      ["html-css", "HTML + CSS", "Zero dependencies"],
                    ].map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => handleExport(value as TechStack)}
                        className="group/item flex w-full flex-col rounded-xl px-2.5 py-2 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-slate-900">{label}</span>
                          <Download className="h-3 w-3 text-slate-300 group-hover/item:text-slate-700 transition-colors" />
                        </div>
                        <span className="text-[10px] text-slate-400">{desc}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md overflow-hidden"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon size={12} className="text-slate-500" />
                )}
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)]"
                  >
                    <div className="px-3 py-2.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Account</p>
                      <p className="mt-0.5 truncate text-[12px] font-bold text-slate-950">
                        {session?.user?.name || "Member"}
                      </p>
                      <p className="truncate text-[10px] text-slate-400">{session?.user?.email}</p>
                    </div>
                    <div className="h-px bg-slate-100 mx-1 mb-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-bold text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={12} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {previewEnabled && (
        <div className="border-b border-sky-100 bg-sky-50/80 px-4 py-1.5 text-center text-[9px] font-black uppercase tracking-[0.3em] text-sky-600 animate-slide-in-left">
          Viewing {currentDevice?.label || activeBreakpoint} · Preview Mode
        </div>
      )}
    </>
  );
}
