// src/utils/exportGenerators.ts
import type { Project } from "@/state/useCanvasStore";

export type TechStack = "react-tailwind" | "react-bootstrap" | "html-css";

export interface ExportResult {
  fileName: string;
  code: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeName(name: string) {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "");
  return /^[A-Za-z]/.test(clean) ? clean : `Project${clean || "Page"}`;
}

// === React + Tailwind ===
function generateReactTailwind(project: Project): ExportResult {
  const compName = sanitizeName(project.name);
  const code = `import React from "react";

export default function ${compName}() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
        <header className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              ${project.name}
            </h1>
            <p className="text-sm text-slate-500">
              Generated from CanvasBuilder
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-50">
            React + Tailwind
          </span>
        </header>

        {/* Layout area – render your Canvas components here */}
        <main className="relative rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-xs text-slate-400">
          Canvas layout preview will render here.
        </main>
      </div>
    </div>
  );
}
`;
  return {
    fileName: `${slugify(project.name) || "page"}-react-tailwind.tsx`,
    code,
  };
}

// === React + Bootstrap ===
function generateReactBootstrap(project: Project): ExportResult {
  const compName = sanitizeName(project.name);
  const code = `import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ${compName}() {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container py-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="h4 mb-1">${project.name}</h1>
                <p className="text-muted small mb-0">
                  Generated from CanvasBuilder
                </p>
              </div>
              <span className="badge text-bg-light border">
                React + Bootstrap
              </span>
            </div>

            {/* Layout area – render your Canvas components here */}
            <div className="border border-dashed rounded p-3 text-muted small bg-light">
              Canvas layout preview will render here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
  return {
    fileName: `${slugify(project.name) || "page"}-react-bootstrap.tsx`,
    code,
  };
}

// === Plain HTML + CSS ===
function generateHtmlCss(project: Project): ExportResult {
  const code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${project.name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #0f172a;
      --surface: #0b1120;
      --card: #020617;
      --border: #1f2937;
      --accent: #3b82f6;
      --accent-soft: rgba(59, 130, 246, 0.12);
      --text: #e5e7eb;
      --muted: #9ca3af;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: radial-gradient(circle at top, #1d283a 0, #020617 55%, #020617 100%);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .shell {
      width: 100%;
      max-width: 1120px;
      border-radius: 18px;
      background: radial-gradient(circle at top left, #111827, #020617);
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(148, 163, 184, 0.25);
      padding: 20px 22px;
    }
    .shell-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .shell-title {
      font-size: 20px;
      font-weight: 600;
    }
    .shell-subtitle {
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
    }
    .shell-tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: rgba(15, 23, 42, 0.7);
      color: var(--muted);
    }
    .canvas {
      margin-top: 4px;
      border-radius: 14px;
      border: 1px dashed rgba(148, 163, 184, 0.5);
      background: rgba(15, 23, 42, 0.55);
      padding: 18px;
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="shell-header">
      <div>
        <h1 class="shell-title">${project.name}</h1>
        <p class="shell-subtitle">Generated from CanvasBuilder</p>
      </div>
      <span class="shell-tag">HTML + CSS export</span>
    </header>

    <!-- Layout area – render your Canvas components here -->
    <section class="canvas">
      Canvas layout preview will render here.
    </section>
  </main>
</body>
</html>`;
  return {
    fileName: `${slugify(project.name) || "page"}.html`,
    code,
  };
}

export function generateExport(
  project: Project,
  tech: TechStack
): ExportResult {
  switch (tech) {
    case "react-tailwind":
      return generateReactTailwind(project);
    case "react-bootstrap":
      return generateReactBootstrap(project);
    case "html-css":
    default:
      return generateHtmlCss(project);
  }
}
