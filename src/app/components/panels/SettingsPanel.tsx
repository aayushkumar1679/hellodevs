"use client";
// SettingsPanel.tsx
import React from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { Trash2, Share2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SettingsPanel() {
  const { currentProject, deleteProject } = useProjectStore();
  const {
    previewEnabled,
    togglePreview,
    threeEnabled,
    toggleThree,
    threeSpeed,
    threeDensity,
    setThreeSpeed,
    setThreeDensity,
  } = useEditorStore();

  if (!currentProject) {
    return (
      <div className="p-4 text-center text-[10px] text-white/25">
        No project loaded
      </div>
    );
  }

  return (
    <div className="space-y-3 text-white">
      {/* Project info */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
          Project
        </p>
        <p className="mt-1 text-[11px] font-semibold text-white/70">
          {currentProject.name}
        </p>
        <p className="mt-0.5 font-mono text-[9px] text-white/20">
          {currentProject.id}
        </p>
      </div>

      {/* Preview toggle */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-white/60">
              Preview Mode
            </p>
            <p className="text-[9px] text-white/25">
              Show device frame on canvas
            </p>
          </div>
          <button
            onClick={togglePreview}
            className={`flex h-6 w-10 items-center rounded-full transition-colors ${previewEnabled ? "bg-violet-600" : "bg-white/10"}`}
          >
            <div
              className={`h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5 ${previewEnabled ? "translate-x-4" : "translate-x-0"}`}
            />
          </button>
        </div>
      </div>

      {/* Canvas FX */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-white/60">
              3D Backdrop
            </p>
            <p className="text-[9px] text-white/25">
              Subtle Three.js ambient scene
            </p>
          </div>
          <button
            onClick={toggleThree}
            className={`flex h-6 w-10 items-center rounded-full transition-colors ${
              threeEnabled ? "bg-violet-600" : "bg-white/10"
            }`}
            title={threeEnabled ? "Disable 3D background" : "Enable 3D background"}
          >
            <div
              className={`h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5 ${
                threeEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <div className={`mt-3 space-y-2 ${threeEnabled ? "" : "opacity-50"}`}>
          <div className="flex items-center justify-between text-[9px] font-semibold text-white/50">
            <span>Speed</span>
            <span className="text-white/70">{threeSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={2.5}
            step={0.1}
            value={threeSpeed}
            disabled={!threeEnabled}
            onChange={(e) => setThreeSpeed(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex items-center justify-between text-[9px] font-semibold text-white/50">
            <span>Density</span>
            <span className="text-white/70">{threeDensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.4}
            max={2.5}
            step={0.1}
            value={threeDensity}
            disabled={!threeEnabled}
            onChange={(e) => setThreeDensity(Number(e.target.value))}
            className="w-full accent-sky-400"
          />
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-1.5">
          Quick Links
        </p>
        <Link
          href={`/builder/${currentProject.id}/preview`}
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-white/40 transition hover:bg-white/[0.04] hover:text-white/60"
        >
          <ExternalLink className="h-3 w-3" /> Open Preview
        </Link>
        <Link
          href={`/share/${currentProject.id}`}
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-white/40 transition hover:bg-white/[0.04] hover:text-white/60"
        >
          <Share2 className="h-3 w-3" /> Share Link
        </Link>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-rose-500/15 bg-rose-500/4 p-2.5">
        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-rose-500/60">
          Danger Zone
        </p>
        <button
          onClick={() => {
            if (window.confirm(`Delete "${currentProject.name}"?`)) {
              deleteProject(currentProject.id);
            }
          }}
          className="flex h-7 w-full items-center gap-1.5 rounded-lg border border-rose-500/20 px-2.5 text-[10px] font-semibold text-rose-400/70 transition hover:border-rose-500/40 hover:bg-rose-500/8 hover:text-rose-400"
        >
          <Trash2 className="h-3 w-3" /> Delete Project
        </button>
      </div>
    </div>
  );
}
