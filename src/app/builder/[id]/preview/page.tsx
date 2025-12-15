"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCanvasStore } from "@/state/useCanvasStore";
import CanvasPreview from "@/app/components/export/CanvasPreview";

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const store = useCanvasStore();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load project from store
    const currentProject = store.projects.find((p) => p.id === projectId);

    if (currentProject) {
      setProject(currentProject);
    }

    setLoading(false);
  }, [projectId, store.projects]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
            <p className="text-sm text-gray-600">
              {project.components.length} components
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/builder/${projectId}`}>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm font-medium">
                ← Back to Editor
              </button>
            </Link>
            <a
              href={`/share/${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium">
                🔗 Share Link
              </button>
            </a>
          </div>
        </div>
      </header>

      {/* Preview */}
      <div className="flex-1 overflow-y-auto">
        <CanvasPreview components={project.components} />
      </div>
    </div>
  );
}
