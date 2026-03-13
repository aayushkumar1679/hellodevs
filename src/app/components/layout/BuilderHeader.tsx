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
  ChevronDown,
  LogOut,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useEditorStore } from "@/state/useEditorStore";
import { useDesignStore } from "@/state/useDesignStore";
import { generateExport, type TechStack } from "@/utils/exportGenerators";

export default function BuilderHeader() {
  const { undo, redo, currentProject } = useCanvasStore();
  const elements = useDesignStore((state) => state.elements);
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
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const deviceIcons = {
    mobile: <Smartphone size={14} />,
    tablet: <Tablet size={14} />,
    desktop: <Monitor size={14} />,
  };

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
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.85)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Polyglot Studio
                </p>
                <h1 className="truncate text-sm font-semibold text-slate-950">
                  {currentProject?.name || "Untitled Project"}
                </h1>
              </div>
            </Link>

            {currentProject?.id && (
              <Link
                href={`/builder/${currentProject.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 sm:inline-flex"
              >
                Open preview
              </Link>
            )}
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm md:flex">
            <button
              onClick={undo}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowDeviceMenu((value) => !value)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
              >
                {deviceIcons[activeBreakpoint]}
                <span>{currentDevice.label}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showDeviceMenu && (
                <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
                  {Object.keys(breakpoints).map((bp) => (
                    <button
                      key={bp}
                      onClick={() => {
                        setBreakpoint(bp as typeof activeBreakpoint);
                        setDesignBreakpoint(bp as typeof activeBreakpoint);
                        setShowDeviceMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium transition ${
                        activeBreakpoint === bp
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {deviceIcons[bp as keyof typeof deviceIcons]}
                      {breakpoints[bp as keyof typeof breakpoints].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={togglePreview}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm transition ${
                previewEnabled
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
              }`}
              title="Toggle preview"
            >
              {previewEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExport((value) => !value)}
                disabled={isExporting}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isExporting ? "Exporting..." : "Export"}
              </button>

              {showExport && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
                  {[
                    ["react-tailwind", "React + Tailwind"],
                    ["react-bootstrap", "React + Bootstrap"],
                    ["html-css", "HTML + CSS"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => handleExport(value as TechStack)}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      <span>{label}</span>
                      <Download className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
              >
                {session?.user?.image ? (
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
                      {session?.user?.name || "Guest"}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {session?.user?.email}
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
          </div>
        </div>
      </header>

      {previewEnabled && (
        <div className="border-b border-slate-200/80 bg-[linear-gradient(90deg,#fff7ed_0%,#ffffff_45%,#eff6ff_100%)] px-5 py-2 text-center text-xs text-slate-600">
          Previewing at{" "}
          <span className="font-semibold text-slate-950">{currentDevice.label}</span>
        </div>
      )}
    </>
  );
}
