"use client";

<<<<<<< HEAD
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useBuilderStore } from "@/state/useBuilderStore";
import CanvasRenderer from "@/app/components/canvas/CanvasRenderer";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import LeftSidebar from "@/app/components/layout/LeftSidebar";
import RightPanel from "@/app/components/layout/RightPanel";
=======
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, PanelRightOpen, Sparkles, Wand2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import LeftSidebar from "@/app/components/layout/LeftSidebar";
import RightPanel from "@/app/components/layout/RightPanel";
import Canvas from "@/app/components/canvas/Canvas";
import ComponentLibrary from "@/app/components/panels/ComponentLibrary";
import LayersPanel from "@/app/components/panels/LayersPanel";
import AIPromptPanel from "@/app/components/panels/AIPromptPanel";
import HistoryPanel from "@/app/components/panels/HistoryPanel";
import AssetsPanel from "@/app/components/panels/AssetsPanel";
import { useParams } from "next/navigation";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { useEffect } from "react";
>>>>>>> 6e8c38d520200562c64debe5001cecaae528a090

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
<<<<<<< HEAD

  const project = useBuilderStore((s) => s.project);
  const createProject = useBuilderStore((s) => s.createProject);
  const loadProject = useBuilderStore((s) => s.loadProject);
  const deselectAll = useBuilderStore((s) => s.deselectAll);

  useEffect(() => {
    // If no project loaded OR id mismatch → create fresh project
    if (!project || project.id !== projectId) {
      const newProject = createProject("Untitled Project");
      loadProject({ ...newProject, id: projectId });
    }
  }, [projectId]);
=======
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
        const existingProject = useCanvasStore.getState().projects[projectId];
        if (existingProject) setCurrentProject(projectId);
        await fetchProject(projectId);
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    if (projectId) void loadProject();
    return () => { mounted = false; };
  }, [fetchProject, projectId, setCurrentProject]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
      if (event.key === "Escape") deselectAll();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, deselectAll]);
>>>>>>> 6e8c38d520200562c64debe5001cecaae528a090

  // Loading State
  if (isLoading && currentProjectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="max-w-sm rounded-3xl border border-white/80 bg-white p-8 text-center shadow-[0_30px_80px_-20px_rgba(15,23,42,0.2)]"
        >
          <motion.div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
          </motion.div>
          <p className="text-sm font-bold text-slate-950">Opening studio…</p>
          <p className="mt-1 text-xs text-slate-400">Syncing project state</p>
          <motion.div
            className="mt-5 h-1 rounded-full bg-slate-100 overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-slate-950 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
<<<<<<< HEAD
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      {/* Top Header */}
      <BuilderHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Canvas Area */}
        <main
          className="flex-1 overflow-auto bg-gray-800"
          onClick={() => deselectAll()}
        >
          <div className="min-h-full p-6 flex justify-center">
            <div className="w-full max-w-[1200px] bg-white shadow-lg">
              <CanvasRenderer />
            </div>
          </div>
        </main>

        {/* Right Panel */}
        <RightPanel />
=======
    <div
      className="flex h-screen flex-col text-slate-950 overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <BuilderHeader />

      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 0 }}>
        {/* Left Sidebar */}
        <LeftSidebar activeLeftPanel={activeLeftPanel} setActiveLeftPanel={setActiveLeftPanel} />

        {/* Left Panel (Slide-in) */}
        <AnimatePresence>
          {activeLeftPanel && activeLeftPanel !== "ai" && (
            <motion.div
              key="left-panel"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="border-r border-slate-200/80 bg-white/90 backdrop-blur-xl overflow-y-auto"
              style={{
                width: "var(--left-panel-w)",
                marginLeft: "var(--left-sidebar-w)",
                marginTop: "var(--header-h)",
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 35,
              }}
            >
              {activeLeftPanel === "components" && <ComponentLibrary />}
              {activeLeftPanel === "layers" && <LayersPanel />}
              {activeLeftPanel === "assets" && <AssetsPanel />}
              {activeLeftPanel === "history" && <HistoryPanel />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Prompt Panel — Full-screen Modal */}
        <AnimatePresence>
          {activeLeftPanel === "ai" && (
            <motion.div
              key="ai-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: "rgba(15,15,17,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <motion.div
                initial={{ scale: 0.92, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 24 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white rounded-[36px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden border border-white/10"
                style={{ height: "min(88vh, 700px)" }}
              >
                <button
                  onClick={() => setActiveLeftPanel(null)}
                  className="absolute top-5 right-5 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
                <AIPromptPanel />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <div
          className="relative flex-1 overflow-hidden"
          style={{
            marginLeft: activeLeftPanel && activeLeftPanel !== "ai"
              ? `calc(var(--left-sidebar-w) + var(--left-panel-w))`
              : "var(--left-sidebar-w)",
            marginRight: isRightPanelOpen ? "var(--right-panel-w)" : 0,
            marginTop: "var(--header-h)",
            transition: "margin 0.2s ease",
          }}
        >
          {/* Canvas Background Decor */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.07),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.1),transparent_35%)]" />
            <div className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%230f172a'/%3E%3C/svg%3E\")",
                backgroundSize: "20px 20px",
              }}
            />
          </div>
          <Canvas />
        </div>

        {/* Right Panel */}
        {isRightPanelOpen && (
          <RightPanel isOpen={isRightPanelOpen} onClose={() => setIsRightPanelOpen(false)} />
        )}

        {/* Reopen Right Panel Button */}
        {!isRightPanelOpen && (
          <motion.button
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            type="button"
            onClick={() => setIsRightPanelOpen(true)}
            className="fixed right-4 z-30 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur-xl transition hover:border-slate-300 hover:text-slate-950"
            style={{ top: "calc(var(--header-h) + 12px)" }}
          >
            <PanelRightOpen className="h-3 w-3" />
            Inspector
          </motion.button>
        )}
>>>>>>> 6e8c38d520200562c64debe5001cecaae528a090
      </div>
    </div>
  );
}
