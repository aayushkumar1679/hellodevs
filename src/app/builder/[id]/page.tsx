"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, PanelRightOpen, Sparkles, Wand2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import LeftSidebar, { LeftPanelId } from "@/app/components/layout/LeftSidebar";
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
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";

export default function BuilderPage() {
  const { id: projectId } = useParams();
  const { currentProject, currentProjectId, isLoading } = useProjectStore();
  const [activeLeftPanel, setActiveLeftPanel] = useState<LeftPanelId>("components");

  // Selection state
  const { selectedElements } = useEditorStore();

  // Handle mobile / responsive widths if needed
  useEffect(() => {
    // Initial setup logic
  }, []);

  // Error / Not Found
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

  return (
    <div
      className="flex h-screen w-screen max-w-none flex-col text-slate-950 overflow-hidden"
      style={{ background: "var(--background)", width: '100vw !important', maxWidth: 'none !important' }}
    >
      <BuilderHeader />

      <div className="flex-1 overflow-hidden relative" style={{ display: 'flex', width: '100% !important', maxWidth: 'none !important' }}>
        {/* Permanent Left Tab Strip */}
        <LeftSidebar activeLeftPanel={activeLeftPanel} setActiveLeftPanel={setActiveLeftPanel} />

        <PanelGroup orientation="horizontal" className="flex-1 w-full" id="polyglot-builder-v11">
          {/* Left Panel Area */}
          {activeLeftPanel && (
            <Panel
              id="left-sidebar-v11"
              defaultSize={25}
              minSize={15}
              maxSize={40}
              className="z-[30] bg-white border-r border-slate-200 overflow-hidden relative"
              style={{ minWidth: '350px' }}
            >
              <div className="h-full overflow-y-auto custom-scrollbar">
                <ErrorBoundary componentName="LeftPanel">
                  {activeLeftPanel === "ai" && <AIPromptPanel />}
                  {activeLeftPanel === "components" && <ComponentLibrary />}
                  {activeLeftPanel === "custom" && <CustomComponentPanel />}
                  {activeLeftPanel === "layers" && <LayersPanel />}
                  {activeLeftPanel === "assets" && <AssetsPanel />}
                  {activeLeftPanel === "history" && <HistoryPanel />}
                </ErrorBoundary>
              </div>
            </Panel>
          )}
          {activeLeftPanel && (
            <PanelResizeHandle className="w-1.5 bg-transparent hover:bg-sky-500/30 transition-colors cursor-col-resize z-50 flex items-center justify-center group">
              <div className="w-[1px] h-8 bg-slate-300 group-hover:bg-sky-500 transition-colors" />
            </PanelResizeHandle>
          )}

          {/* Canvas Center Area */}
          <Panel 
            id="canvas-v11" 
            defaultSize={50} 
            minSize={30} 
            className="relative z-[10] flex flex-col bg-slate-50/50 overflow-hidden"
          >
            <main className="flex-1 overflow-hidden relative">
              <Canvas />
            </main>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-transparent hover:bg-sky-500/30 transition-colors cursor-col-resize z-50 flex items-center justify-center group">
            <div className="w-[1px] h-8 bg-slate-300 group-hover:bg-sky-500 transition-colors" />
          </PanelResizeHandle>

          {/* Right Panel Area */}
          <Panel
            id="right-sidebar-v11"
            defaultSize={25}
            minSize={15}
            maxSize={45}
            className="z-[30] bg-white border-l border-slate-200 shadow-2xl overflow-hidden relative"
            style={{ minWidth: '350px' }}
          >
            <RightPanel />
          </Panel>
        </PanelGroup>

        {/* Floating AI Chat Widget */}
        <AIChatWidget />
      </div>
    </div>
  );
}
