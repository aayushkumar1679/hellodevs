"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CanvasPreview from "@/app/components/export/CanvasPreview";
import { useCanvasStore } from "@/state/useCanvasStore";
import { generateReactCode } from "@/utils/codeGenerator";

export default function SharePage() {
  const params = useParams();
  const projectId = params.id as string;
  const store = useCanvasStore();

  const [project, setProject] = useState<any>(null);
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get project from store
    const currentProject = store.projects.find((p) => p.id === projectId);

    if (currentProject) {
      setProject(currentProject);
    }

    setLoading(false);
  }, [projectId, store.projects]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <p className="text-gray-600 mb-4">
            This project doesn't exist or was deleted
          </p>
          <Link href="/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-gray-600">Shared Preview • View Only</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              {showCode ? "Hide Code" : "View Code"}
            </button>
            <Link href="/">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium">
                Create Your Own
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview */}
        <div className={`${showCode ? "flex-1" : "w-full"} overflow-y-auto`}>
          <CanvasPreview components={project.components} />
        </div>

        {/* Code Panel */}
        {showCode && (
          <div className="w-96 border-l border-gray-200 overflow-auto bg-slate-900 flex flex-col">
            <div className="p-4 border-b border-gray-700 sticky top-0 bg-slate-900">
              <h3 className="font-bold text-white text-sm">React Code</h3>
            </div>
            <pre className="text-xs text-gray-100 font-mono p-4 whitespace-pre-wrap break-words flex-1 overflow-auto">
              <code>{generateReactCode(project.components)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
