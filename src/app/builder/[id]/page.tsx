"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import LeftSidebar from "@/app/components/layout/LeftSidebar";
import RightPanel from "@/app/components/layout/RightPanel";
import Canvas from "@/app/components/canvas/Canvas";
import ComponentLibrary from "@/app/components/panels/ComponentLibrary";
import LayersPanel from "@/app/components/panels/LayersPanel";
import AIPromptPanel from "@/app/components/panels/AIPromptPanel";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { setCurrentProject, undo, redo } = useCanvasStore();
  const { deselectAll } = useDesignStore();
  const [activeLeftPanel, setActiveLeftPanel] = useState<string | null>("ai");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
      useCanvasStore.getState().fetchProjects();
    }
  }, [projectId, setCurrentProject]);

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

  return (
    <div className="flex h-screen flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950">
      <BuilderHeader />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          activePanel={activeLeftPanel}
          onPanelChange={setActiveLeftPanel}
        />

        {activeLeftPanel && (
          <div className="w-[360px] border-r border-slate-200 bg-white/80 backdrop-blur-xl overflow-y-auto">
            {activeLeftPanel === "ai" && <AIPromptPanel />}
            {activeLeftPanel === "components" && <ComponentLibrary />}
            {activeLeftPanel === "layers" && <LayersPanel />}
            {activeLeftPanel === "assets" && (
              <div className="p-6 text-sm text-slate-500">
                Asset management is next in the roadmap. Use the AI panel to
                generate image sections and the inspector to tune visuals.
              </div>
            )}
            {activeLeftPanel === "history" && (
              <div className="p-6 text-sm text-slate-500">
                Version history is still coming. Undo and redo are live in the
                header while we build the full timeline experience.
              </div>
            )}
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
      </div>
    </div>
  );
}
