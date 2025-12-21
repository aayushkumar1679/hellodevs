"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
// import LeftSidebar from "@/app/components/layout/LeftSidebar";
import LeftSidebar from "@/app/components/layout/LeftSidebar";
import RightPanel from "@/app/components/layout/RightPanel";
import Canvas from "@/app/components/canvas/Canvas";
import ComponentLibrary from "@/app/components/panels/ComponentLibrary";
import LayersPanel from "@/app/components/panels/LayersPanel";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { setCurrentProject, undo, redo } = useCanvasStore();
  const { deselectAll } = useDesignStore();
  const [activeLeftPanel, setActiveLeftPanel] = useState<string | null>(
    "components"
  );
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Escape") {
        deselectAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, deselectAll]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <BuilderHeader />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          activePanel={activeLeftPanel}
          onPanelChange={setActiveLeftPanel}
        />

        {activeLeftPanel && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            {activeLeftPanel === "components" && <ComponentLibrary />}
            {activeLeftPanel === "layers" && <LayersPanel />}
            {activeLeftPanel === "assets" && (
              <div className="p-4 text-gray-400 text-sm">
                Assets coming soon
              </div>
            )}
            {activeLeftPanel === "history" && (
              <div className="p-4 text-gray-400 text-sm">
                History coming soon
              </div>
            )}
          </div>
        )}

        <div className="flex-1 bg-gray-700 overflow-auto relative">
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
