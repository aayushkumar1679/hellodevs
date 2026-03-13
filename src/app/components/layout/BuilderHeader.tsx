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
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useEditorStore } from "@/state/useEditorStore";
import { useDesignStore } from "@/state/useDesignStore";
import type { TechStack } from "@/utils/exportGenerators";
import { motion, AnimatePresence } from "framer-motion";

export default function BuilderHeader() {
  const { undo, redo, currentProject } = useCanvasStore();
  const setDesignBreakpoint = useDesignStore((state) => state.setActiveBreakpoint);

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


  const currentDevice = breakpoints[activeBreakpoint];

  const handleExport = async (format: TechStack) => {
    if (!currentProject || isExporting) return;

    setIsExporting(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          format,
        }),
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
    } catch (error) {
      console.error("Export Error:", error);
      alert("Failed to export project. Please try again.");
    } finally {
      setIsExporting(false);
      setShowExport(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-[73px] border-b border-slate-200/80 bg-white/75 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex h-full max-w-[100vw] items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.85)] transition-transform group-hover:scale-105 group-hover:rotate-3 active:scale-95">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  Polyglot Studio
                </p>
                <h1 className="truncate text-sm font-black tracking-tight text-slate-950 group-hover:text-sky-600 transition-colors">
                  {currentProject?.name || "Untitled Project"}
                </h1>
              </div>
            </Link>

            {currentProject?.id && (
              <Link
                href={`/builder/${currentProject.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-all hover:border-slate-400 hover:text-slate-950 hover:shadow-sm sm:inline-flex active:scale-95"
              >
                Preview Pass
              </Link>
            )}
          </div>

          <div className="flex flex-1 items-center justify-center gap-2">
            {(["desktop", "tablet", "mobile"] as const).map((d) => (
              <motion.button
                key={d}
                layout
                onClick={() => {
                  setBreakpoint(d);
                  setDesignBreakpoint(d);
                }}
                className={`flex h-11 w-13 items-center justify-center rounded-[18px] transition-all duration-300 ${
                  activeBreakpoint === d
                    ? "bg-slate-950 text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.6)]"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-950"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                title={d.charAt(0).toUpperCase() + d.slice(1)}
              >
                {d === "desktop" && <Monitor size={20} />}
                {d === "tablet" && <Tablet size={20} />}
                {d === "mobile" && <Smartphone size={20} />}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/50 p-1 shadow-sm md:flex backdrop-blur-md">
              <button
                onClick={undo}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={18} />
              </button>
              <button
                onClick={redo}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 size={18} />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <button
              onClick={togglePreview}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 active:scale-90 ${
                previewEnabled
                  ? "border-sky-500 bg-sky-500 text-white shadow-[0_10px_20px_-8px_rgba(14,165,233,0.5)]"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-950 hover:shadow-sm"
              }`}
              title="Toggle Live Content"
            >
              {previewEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExport((v) => !v)}
                disabled={isExporting}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-6 text-[13px] font-bold text-white transition-all hover:bg-slate-800 hover:shadow-[0_15px_30px_-10px_rgba(15,23,42,0.5)] active:scale-95 disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isExporting ? "Cooking..." : "Export"}
              </button>

              <AnimatePresence>
                {showExport && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.4)]"
                  >
                     <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Standard Packages</p>
                    {[
                      ["react-tailwind", "Next.js + Tailwind", "Production ready"],
                      ["html-css", "Clean HTML + CSS", "Zero dependencies"],
                    ].map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => handleExport(value as TechStack)}
                        className="group/item flex w-full flex-col rounded-[20px] px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-950">{label}</span>
                          <Download className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-slate-950" />
                        </div>
                        <span className="mt-0.5 text-[10px] font-medium text-slate-400">{desc}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-400 hover:shadow-md"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User Profile"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full ring-2 ring-slate-100"
                  />
                ) : (
                  <UserIcon size={18} className="text-slate-500" />
                )}
              </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.4)]"
                    >
                      <div className="px-4 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Account</p>
                        <p className="mt-1 truncate text-sm font-bold text-slate-950">
                          {session?.user?.name || "Member"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {session?.user?.email}
                        </p>
                      </div>
                      <div className="h-px bg-slate-100 mx-1 mb-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                        className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} />
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
        <div className="border-b border-sky-100 bg-sky-50 px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-sky-700 animate-in slide-in-from-top duration-500">
          Viewing {currentDevice.label} Layout
        </div>
      )}
    </>
  );
}
