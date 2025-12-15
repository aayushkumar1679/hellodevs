"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCanvasStore } from "@/state/useCanvasStore";
import Canvas from "@/app/components/canvas/Canvas";
import LibraryPanel from "@/app/components/panels/LibraryPanel";
import PropertyPanel from "@/app/components/panels/PropertyPanel";
import CollaborationPanel from "@/app/components/panels/CollaborationPanel";
import ExportDialog from "@/app/components/export/ExportDialog";
import ShortcutsDialog from "@/app/components/export/ShortcutsDialog";

export default function BuilderPage() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const params = useParams();
  const projectId = params.id as string;
  const {
    loadProject,
    projects,
    currentProjectId,
    undo,
    redo,
    clear,
    selectComponent,
  } = useCanvasStore();

  const [exportOpen, setExportOpen] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);

  useEffect(() => {
    if (projectId !== "new") {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          undo();
        }
        if (e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
      if (e.key === "Escape") {
        selectComponent(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectComponent]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← Projects
            </Link>
            <h1 className="text-2xl font-bold">
              {currentProject?.name || "Builder"}
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={undo}
              className="px-3 py-2 border rounded hover:bg-gray-50 transition text-sm font-medium"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              className="px-3 py-2 border rounded hover:bg-gray-50 transition text-sm font-medium"
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>

            <div className="border-l border-gray-200"></div>

            <a href={`/builder/${projectId}/preview`} target="_blank">
              <button className="px-3 py-2 border rounded hover:bg-gray-50 transition text-sm font-medium">
                👁️ Preview
              </button>
            </a>

            <button
              onClick={() => setExportOpen(true)}
              className="px-3 py-2 border rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              📥 Export
            </button>

            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="px-3 py-2 border rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              🔗 Share
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to clear the canvas?")
                ) {
                  clear();
                  selectComponent(null);
                }
              }}
              className="px-3 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition text-sm font-medium"
            >
              🗑️ Clear
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="px-3 py-2 border rounded hover:bg-gray-50 transition text-sm font-medium"
              title="Keyboard shortcuts"
            >
              ⌨️ Help
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Library Panel */}
        <aside className="w-72 border-r border-gray-200 bg-white overflow-y-auto">
          <LibraryPanel />
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <Canvas />
          </div>
        </main>

        {/* Side Panel (Property or Collaboration) */}
        <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          {showCollaboration ? <CollaborationPanel /> : <PropertyPanel />}
        </aside>
      </div>

      {/* Export Dialog */}
      <ExportDialog isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <ShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
