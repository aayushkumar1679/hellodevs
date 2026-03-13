"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, PanelRightOpen, Sparkles, Wand2 } from "lucide-react";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import LeftSidebar from "@/app/components/layout/LeftSidebar";
import RightPanel from "@/app/components/layout/RightPanel";
import Canvas from "@/app/components/canvas/Canvas";
import ComponentLibrary from "@/app/components/panels/ComponentLibrary";
import LayersPanel from "@/app/components/panels/LayersPanel";
import AIPromptPanel from "@/app/components/panels/AIPromptPanel";
import HistoryPanel from "@/app/components/panels/HistoryPanel";
import AssetsPanel from "@/app/components/panels/AssetsPanel";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { currentProjectId, setCurrentProject, fetchProject, undo, redo } = useCanvasStore();
  const { deselectAll } = useDesignStore();
  const [activeLeftPanel, setActiveLeftPanel] = useState<string | null>("ai");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      setIsLoading(true);

      try {
        // Try to load from local cache first for immediate UI response
        const existingProject = useCanvasStore.getState().projects[projectId];
        if (existingProject) {
          setCurrentProject(projectId);
          // If we have cache, we could set isLoading to false earlier, 
          // but better to wait for the fresh fetch to avoid "flash of old data"
        }

        const project = await fetchProject(projectId);
        
        if (!project && mounted) {
          // If fetch fails and no cache, we have a real problem
          if (!existingProject) {
             setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Critical error loading project:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    if (projectId) {
      void loadProject();
    }

    return () => {
      mounted = false;
    };
  }, [fetchProject, projectId, setCurrentProject]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "y" || (event.key === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      }

      if (event.key === "Escape") {
        deselectAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, deselectAll]);

  if (isLoading && currentProjectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6">
        <div className="max-w-md rounded-[32px] border border-white/80 bg-white/92 p-8 text-center shadow-[0_35px_90px_-45px_rgba(15,23,42,0.35)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-950">
            Opening your studio
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            We’re syncing the latest project structure, styles, and preview state.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && currentProjectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6">
        <div className="max-w-lg rounded-[36px] border border-white/80 bg-white/92 p-8 text-center shadow-[0_40px_100px_-52px_rgba(15,23,42,0.35)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-amber-100 text-amber-700">
            <Wand2 className="h-6 w-6" />
          </div>
          <p className="mt-5 text-xl font-semibold text-slate-950">
            This project could not be opened
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            The link may be outdated, the project may have been removed, or your
            session no longer has access to it.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Back to workspace
            </Link>
            <Link
              href="/builder/new"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start a new project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950">
      <BuilderHeader />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          activeLeftPanel={activeLeftPanel}
          setActiveLeftPanel={setActiveLeftPanel}
        />

        {activeLeftPanel && (
          <div className="w-[360px] border-r border-slate-200 bg-white/80 backdrop-blur-xl overflow-y-auto">
            {activeLeftPanel === "ai" && <AIPromptPanel />}
            {activeLeftPanel === "components" && <ComponentLibrary />}
            {activeLeftPanel === "layers" && <LayersPanel />}
            {activeLeftPanel === "assets" && <AssetsPanel />}
            {activeLeftPanel === "history" && <HistoryPanel />}
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_28%)]" />
          <Canvas />
        </div>

        {isRightPanelOpen && (
          <RightPanel
            isOpen={isRightPanelOpen}
            onClose={() => setIsRightPanelOpen(false)}
          />
        )}

        {!isRightPanelOpen && (
          <button
            type="button"
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/92 px-4 py-2 text-xs font-semibold text-slate-700 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl transition hover:border-slate-300 hover:text-slate-950"
          >
            <PanelRightOpen className="h-4 w-4" />
            Open inspector
          </button>
        )}
      </div>
    </div>
  );
}
