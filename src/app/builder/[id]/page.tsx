"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import LeftSidebar from "@/app/components/layout/LeftSidebar";
import RightPanel from "@/app/components/layout/RightPanel";
import Canvas from "@/app/components/canvas/Canvas";
import ComponentLibrary from "@/app/components/panels/ComponentLibrary";
import LayersPanel from "@/app/components/panels/LayersPanel";
import AIPromptPanel from "@/app/components/panels/AIPromptPanel";
import HistoryPanel from "@/app/components/panels/HistoryPanel";
import AssetsPanel from "@/app/components/panels/AssetsPanel";
import CustomComponentPanel from "@/app/components/panels/CustomComponentPanel";
import AIChatWidget from "@/app/components/AIChatWidget";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// ─── Panel widths ──────────────────────────────────────────────
const LEFT_STRIP_W = 40; // px — icon-only strip
const LEFT_PANEL_W = 240; // px — expanded content panel
const RIGHT_PANEL_W = 256; // px — right inspector

type LeftPanelId =
  | "ai"
  | "components"
  | "custom"
  | "layers"
  | "assets"
  | "history"
  | null;

export default function BuilderPage() {
  const { id: projectId } = useParams();
  const { currentProject, currentProjectId, isLoading } = useProjectStore();
  const { selectedElements } = useEditorStore();

  const [activeLeftPanel, setActiveLeftPanel] =
    useState<LeftPanelId>("components");
  const [rightOpen, setRightOpen] = useState(true);

  // Auto-open right panel when something is selected
  useEffect(() => {
    if (selectedElements.length > 0) setRightOpen(true);
  }, [selectedElements]);

  // ── Not found state ──────────────────────────────────────────
  if (!isLoading && currentProjectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0C0C0F]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm rounded-2xl border border-white/8 bg-white/4 p-8 text-center shadow-2xl backdrop-blur"
        >
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            <Wand2 className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-white">Project not found</p>
          <p className="mt-1 text-xs leading-5 text-white/40">
            This project may have been removed or you lost access.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/builder/new"
              className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500"
            >
              New project <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const leftPanelOpen = activeLeftPanel !== null;

  return (
    /*
     * ROOT: full-screen dark container
     * Uses pure flex column — NO fixed positioning anywhere.
     * Header is shrink-0, workspace is flex-1.
     * Workspace is flex row: [icon-strip][left-panel?][canvas][right-panel?]
     * Everything is in-flow — sidebars can NEVER go behind the canvas.
     */
    <div className="flex h-screen flex-col overflow-hidden bg-[#0C0C0F] text-white">
      {/* ── Top header ─────────────────────────────────────────── */}
      <BuilderHeader
        rightOpen={rightOpen}
        onToggleRight={() => setRightOpen((v) => !v)}
      />

      {/* ── Workspace row ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left icon strip (always visible, never fixed) ─────── */}
        <LeftSidebar
          activeLeftPanel={activeLeftPanel}
          setActiveLeftPanel={setActiveLeftPanel}
          width={LEFT_STRIP_W}
        />

        {/* ── Left panel (conditionally visible) ────────────────── */}
        {leftPanelOpen && (
          <motion.div
            key={activeLeftPanel}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: LEFT_PANEL_W, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 overflow-hidden border-r border-white/[0.06] bg-[#111114]"
            style={{ width: LEFT_PANEL_W }}
          >
            <div
              className="h-full overflow-y-auto overflow-x-hidden"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#2a2a30 transparent",
              }}
            >
              <ErrorBoundary componentName="LeftPanel">
                {activeLeftPanel === "ai" && <AIPromptPanel />}
                {activeLeftPanel === "components" && <ComponentLibrary />}
                {activeLeftPanel === "custom" && <CustomComponentPanel />}
                {activeLeftPanel === "layers" && <LayersPanel />}
                {activeLeftPanel === "assets" && <AssetsPanel />}
                {activeLeftPanel === "history" && <HistoryPanel />}
              </ErrorBoundary>
            </div>
          </motion.div>
        )}

        {/* ── Resize handle between left panel and canvas ────────── */}
        {leftPanelOpen && (
          <div className="group w-[1px] flex-shrink-0 cursor-col-resize bg-white/[0.06] transition-colors hover:bg-violet-500/60" />
        )}

        {/* ── Canvas (takes all remaining space) ────────────────── */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          <ErrorBoundary componentName="Canvas">
            <Canvas />
          </ErrorBoundary>
        </main>

        {/* ── Resize handle between canvas and right panel ────────── */}
        {rightOpen && (
          <div className="group w-[1px] flex-shrink-0 cursor-col-resize bg-white/[0.06] transition-colors hover:bg-violet-500/60" />
        )}

        {/* ── Right inspector panel ─────────────────────────────── */}
        {rightOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: RIGHT_PANEL_W, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 overflow-hidden border-l border-white/[0.06] bg-[#111114]"
            style={{ width: RIGHT_PANEL_W }}
          >
            <RightPanel onClose={() => setRightOpen(false)} />
          </motion.div>
        )}
      </div>

      {/* ── Floating AI chat ──────────────────────────────────── */}
      <AIChatWidget />
    </div>
  );
}
