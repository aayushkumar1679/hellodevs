"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useBuilderStore } from "@/state/useBuilderStore";
import CanvasRenderer from "@/app/components/canvas/CanvasRenderer";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import LeftSidebar from "@/app/components/layout/LeftSidebar";
import RightPanel from "@/app/components/layout/RightPanel";

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.id as string;

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

  return (
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
      </div>
    </div>
  );
}
