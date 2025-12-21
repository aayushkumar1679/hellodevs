"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  useCanvasStore,
  Project as CanvasProject,
} from "@/state/useCanvasStore";
import { generateExport, TechStack } from "@/utils/exportGenerators";
import {
  Plus,
  Trash2,
  ExternalLink,
  Edit2,
  Grid,
  List,
  Search,
  Folder,
  Sparkles,
  Download,
  Eye,
  Copy,
  Filter,
  X,
  Check,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  components?: any[];
  createdAt: string;
  updatedAt?: string;
  starred?: boolean;
  views?: number;
}

export default function EnhancedDashboard() {
  const {
    projects: projectsRecord,
    createProject,
    deleteProject,
  } = useCanvasStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "name" | "views">("recent");
  const [filterType, setFilterType] = useState<"all" | "website" | "form">(
    "all"
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set()
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [exportProjectId, setExportProjectId] = useState<string | null>(null);
  const [exportTech, setExportTech] = useState<TechStack>("react-tailwind");

  // Convert projects object to array for dashboard
  const projectsArray: Project[] = useMemo(
    () =>
      Object.values(projectsRecord).map((p: CanvasProject) => ({
        id: p.id,
        name: p.name,
        description: p.name,
        type: "website",
        createdAt: p["createdAt"] ?? new Date().toISOString(),
        updatedAt: p["updatedAt"],
        components: Object.values(p.components || {}),
      })),
    [projectsRecord]
  );

  const enrichedProjects = useMemo(
    () =>
      projectsArray.map((p: Project) => ({
        ...p,
        starred: Math.random() > 0.6,
        views: Math.floor(Math.random() * 500),
      })),
    [projectsArray]
  );

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  useEffect(() => {
    localStorage.setItem("canvas-projects", JSON.stringify(projectsArray));
  }, [projectsArray]);

  const filteredProjects = useMemo(() => {
    let filtered = enrichedProjects.filter((project: Project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === "all" || (project.type || "website") === filterType;
      return matchesSearch && matchesType;
    });

    if (sortBy === "name") {
      filtered.sort((a: Project, b: Project) => a.name.localeCompare(b.name));
    } else if (sortBy === "views") {
      filtered.sort(
        (a: Project, b: Project) => (b.views || 0) - (a.views || 0)
      );
    } else {
      filtered.sort(
        (a: Project, b: Project) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
    }

    return filtered;
  }, [enrichedProjects, searchQuery, filterType, sortBy]);

  const stats = useMemo(
    () => ({
      total: enrichedProjects.length,
      active: enrichedProjects.length,
      storage: (
        enrichedProjects.reduce(
          (acc: number, p: Project) => acc + (p.components?.length || 0),
          0
        ) * 0.5
      ).toFixed(1),
      totalViews: enrichedProjects.reduce(
        (acc: number, p: Project) => acc + (p.views || 0),
        0
      ),
    }),
    [enrichedProjects]
  );

  const handleCopyLink = (projectId: string) => {
    navigator.clipboard.writeText(`/share/${projectId}`);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBulkDelete = () => {
    if (selectedProjects.size === 0) return;
    if (window.confirm(`Delete ${selectedProjects.size} projects?`)) {
      selectedProjects.forEach((id) => deleteProject(id));
      setSelectedProjects(new Set());
    }
  };

  const openExportFor = (id: string) => {
    setExportProjectId(id);
    setExportTech("react-tailwind");
  };

  const closeExport = () => {
    setExportProjectId(null);
  };

  const currentExportProject =
    exportProjectId != null ? projectsRecord[exportProjectId] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">CB</span>
                </div>
                <h1 className="text-sm font-semibold text-slate-900 hidden sm:block">
                  CanvasBuilder
                </h1>
              </div>
              <div className="h-6 w-6 bg-blue-400 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
                <div className="h-4 bg-slate-300 rounded w-10" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse"
              >
                <div className="h-24 bg-slate-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">CB</span>
              </div>
              <h1 className="text-sm font-semibold text-slate-900 hidden sm:block">
                CanvasBuilder
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs w-full bg-transparent outline-none placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="p-1.5 hover:bg-slate-100 rounded transition-colors"
              >
                {viewMode === "grid" ? (
                  <List className="w-4 h-4 text-slate-600" />
                ) : (
                  <Grid className="w-4 h-4 text-slate-600" />
                )}
              </button>
              <Link href="/builder/new">
                <button className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Projects", value: stats.total, icon: Folder },
            { label: "Views", value: stats.totalViews, icon: Eye },
            { label: "Storage", value: `${stats.storage}MB`, icon: Download },
            { label: "Active", value: stats.active, icon: Sparkles },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter & Sort */}
        {filteredProjects.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded transition-colors flex items-center gap-1"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "recent" | "name" | "views")
                }
                className="text-xs px-2.5 py-1.5 border border-slate-200 text-slate-700 bg-white rounded hover:bg-slate-50 transition-colors outline-none"
              >
                <option value="recent">Latest</option>
                <option value="name">Name</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {selectedProjects.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">
                  {selectedProjects.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedProjects(new Set())}
                  className="text-xs px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="mb-4 p-3 bg-white border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900">Type</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              {(["all", "website", "form"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-xs px-2.5 py-1.5 rounded transition-all font-medium ${
                    filterType === type
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
            <Plus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {searchQuery
                ? "Try a different search"
                : "Create your first project to get started"}
            </p>
            <Link href="/builder/new">
              <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Create Project
              </button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProjects.map((project: Project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="h-20 bg-linear-to-br from-blue-100 to-indigo-100 relative" />

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 flex-1">
                      {project.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      {project.type || "Web"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-2 line-clamp-1">
                    {project.description || "No description"}
                  </p>

                  <div className="text-xs text-slate-400 mb-2.5">
                    {new Date(
                      project.updatedAt || project.createdAt
                    ).toLocaleDateString()}{" "}
                    • {project.components?.length || 0} items
                  </div>

                  <div className="flex gap-1.5">
                    <Link href={`/builder/${project.id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-medium transition-colors">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </Link>

                    <Link
                      href={`/builder/${project.id}/preview`}
                      target="/blank"
                    >
                      <button
                        className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </Link>

                    <button
                      onClick={() => handleCopyLink(project.id)}
                      className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs transition-colors"
                      title="Copy link"
                    >
                      {copiedId === project.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      onClick={() => openExportFor(project.id)}
                      className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs transition-colors"
                      title="Export"
                    >
                      <Download className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${project.name}"?`)) {
                          deleteProject(project.id);
                          const newSet = new Set(selectedProjects);
                          newSet.delete(project.id);
                          setSelectedProjects(newSet);
                        }
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 text-red-600 hover:bg-red-50 rounded text-xs transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedProjects.size === filteredProjects.length &&
                          filteredProjects.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects(
                              new Set(
                                filteredProjects.map((p: Project) => p.id)
                              )
                            );
                          } else {
                            setSelectedProjects(new Set());
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-1 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600 hidden sm:table-cell">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600 hidden md:table-cell">
                      Items
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Updated
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProjects.map((project: Project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedProjects.has(project.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedProjects);
                            if (e.target.checked) {
                              newSet.add(project.id);
                            } else {
                              newSet.delete(project.id);
                            }
                            setSelectedProjects(newSet);
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">
                          {project.name}
                        </div>
                        <div className="text-slate-500 hidden sm:block">
                          {project.description || "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2 hidden sm:table-cell text-slate-600">
                        {project.type || "Website"}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell text-slate-600">
                        {project.components?.length || 0}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(
                          project.updatedAt || project.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/builder/${project.id}`}>
                            <button className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </Link>

                          <Link href={`/preview/${project.id}`}>
                            <button className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                              <Eye className="w-3 h-3" />
                            </button>
                          </Link>

                          <button
                            onClick={() => handleCopyLink(project.id)}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          >
                            {copiedId === project.id ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>

                          <button
                            onClick={() => openExportFor(project.id)}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          >
                            <Download className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${project.name}"?`)) {
                                deleteProject(project.id);
                                const newSet = new Set(selectedProjects);
                                newSet.delete(project.id);
                                setSelectedProjects(newSet);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      {currentExportProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Export: {currentExportProject.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Choose a tech stack, preview the generated code, and download
                  the file.
                </p>
              </div>
              <button
                onClick={closeExport}
                className="p-1.5 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-slate-600">
                Tech stack:
              </span>
              <button
                onClick={() => setExportTech("react-tailwind")}
                className={`text-xs px-2.5 py-1.5 rounded border ${
                  exportTech === "react-tailwind"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                React + Tailwind
              </button>
              <button
                onClick={() => setExportTech("react-bootstrap")}
                className={`text-xs px-2.5 py-1.5 rounded border ${
                  exportTech === "react-bootstrap"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                React + Bootstrap
              </button>
              <button
                onClick={() => setExportTech("html-css")}
                className={`text-xs px-2.5 py-1.5 rounded border ${
                  exportTech === "html-css"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                HTML + CSS
              </button>
            </div>

            {(() => {
              const { code, fileName } = generateExport(
                currentExportProject,
                exportTech
              );
              const handleDownload = () => {
                const blob = new Blob([code], {
                  type: "text/plain;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
              };

              return (
                <>
                  <div className="flex-1 overflow-hidden px-4 pb-3 pt-2 flex flex-col">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500 truncate">
                        {fileName}
                      </span>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-950 flex-1">
                      <pre className="text-[11px] leading-relaxed text-slate-50 p-3 overflow-auto">
                        <code>{code}</code>
                      </pre>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
