"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

import IDEShell from "@/components/ide/IDEShell";
import FileTree from "@/components/ide/FileTree";
import CodeEditor from "@/components/ide/CodeEditor";
import Terminal from "@/components/ide/Terminal";
import Canvas from "@/app/components/canvas/Canvas";
import RightPanel from "@/app/components/layout/RightPanel";
import LivePreview from "@/components/ide/LivePreview";

import ComponentLibrary from "@/app/components/panels/ComponentLibrary";
import AIPromptPanel from "@/app/components/panels/AIPromptPanel";
import AssetsPanel from "@/app/components/panels/AssetsPanel";
import LayersPanel from "@/app/components/panels/LayersPanel";

import { useParams } from "next/navigation";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { initCanvasToCodeSync } from "@/lib/codeSync/canvasToCode";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

export default function BuilderPage() {
  const { id: projectId } = useParams();
  const { currentProject, currentProjectId, isLoading } = useProjectStore();
  const { selectedElements, viewMode } = useEditorStore();

  useEffect(() => {
    // Initial setup logic
    initCanvasToCodeSync();
  }, []);

  if (!isLoading && currentProjectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-3xl border border-white/80 bg-white p-8 text-center shadow-[0_30px_80px_-20px_rgba(15,23,42,0.2)]"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
            <Wand2 className="h-5 w-5" />
          </div>
          <p className="text-base font-bold text-slate-950">Project not found</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            This project may have been removed or you no longer have access.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 transition">
              Back to workspace
            </Link>
            <Link href="/builder/new" className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">
              New project <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  let mainContent = null;
  
  if (viewMode === "design") {
    mainContent = <Canvas />;
  } else if (viewMode === "code") {
    mainContent = <CodeEditor />;
  } else if (viewMode === "split" || viewMode === "diff") {
    mainContent = (
      <PanelGroup orientation="horizontal" className="h-full w-full">
        <Panel defaultSize={viewMode === "split" ? 50 : 60} minSize={20} className="relative flex flex-col h-full bg-[var(--bg-base)] overflow-hidden">
          <Canvas />
        </Panel>
        
        <PanelResizeHandle className="w-1.5 bg-transparent hover:bg-[var(--accent-primary)]/30 transition-colors cursor-col-resize z-50 flex items-center justify-center group">
          <div className="w-[1px] h-8 bg-[var(--border-strong)] group-hover:bg-[var(--accent-primary)] transition-colors" />
        </PanelResizeHandle>
        
        <Panel defaultSize={viewMode === "split" ? 50 : 40} minSize={20} className="relative flex flex-col h-full bg-[var(--bg-base)] border-l border-[var(--border-subtle)] overflow-hidden">
          {viewMode === "diff" ? (
            <div className="flex items-center justify-center w-full h-full text-[var(--text-muted)] font-mono text-xs">
              Visual Diff View (Coming Soon)
            </div>
          ) : (
            <CodeEditor />
          )}
        </Panel>
      </PanelGroup>
    );
  } else if (viewMode === "preview") {
    mainContent = <LivePreview />;
  }

  return (
    <IDEShell
      leftPanels={{
        explorer: <FileTree />,
        search: <div className="p-4 text-xs text-[var(--text-muted)]">Search (Coming soon)</div>,
        components: <ComponentLibrary />,
        agent: <AIPromptPanel />,
        assets: <AssetsPanel />
      }}
      rightPanel={<RightPanel />}
      bottomPanel={<Terminal />}
    >
      {mainContent}
    </IDEShell>
  );
}
