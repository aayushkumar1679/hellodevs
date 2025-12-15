"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCanvasStore } from "@/state/useCanvasStore";
import { TEMPLATES } from "@/utils/templates";

export default function NewProjectPage() {
  const { createProject } = useCanvasStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (
    templateKey: string,
    templateData: any
  ) => {
    const projectName = prompt(`Enter project name:`, templateData.name);
    if (!projectName) return;

    setLoading(true);

    // Create project with store (synchronous)
    createProject(projectName, templateData.components);

    // Get the newly created project ID from store
    const { projects } = useCanvasStore.getState();
    const newProject = projects[projects.length - 1];

    // Navigate to builder with the new project ID
    setTimeout(() => {
      router.push(`/builder/${newProject.id}`);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">New Project</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-slate-300 mb-8">Choose a template to get started:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(TEMPLATES).map(([key, template]: [string, any]) => (
            <div
              key={key}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition group"
            >
              <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition" />

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {template.description}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {template.components.length} pre-built components
                </p>
                <button
                  onClick={() => handleCreateProject(key, template)}
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition text-sm font-medium"
                >
                  {loading ? "Creating..." : "Use Template"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
