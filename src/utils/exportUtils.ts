import type { Project } from "@/state/useCanvasStore";

// We need the design state to get the styles (width, color, etc.)
// Assuming your design store structure based on your CanvasElement code
interface DesignState {
  elements: Record<
    string,
    {
      cssProperties: Record<string, any>;
      type: string;
      // ... other props
    }
  >;
}

export type TechStack = "react-tailwind" | "html-css";

export interface ExportResult {
  fileName: string;
  code: string;
}

// Helper: Convert CSS Object to Tailwind Classes (Simplified)
// In a real app, this would be a massive switch case or use a library
function stylesToTailwind(css: Record<string, any>): string {
  const classes: string[] = [];

  if (css.display === "flex") classes.push("flex");
  if (css.flexDirection === "column") classes.push("flex-col");
  if (css.justifyContent === "center") classes.push("justify-center");
  if (css.alignItems === "center") classes.push("items-center");

  // Padding
  if (css.padding === "16px") classes.push("p-4");
  if (css.padding === "24px") classes.push("p-6");

  // Colors (Approximations)
  if (css.backgroundColor === "#ffffff") classes.push("bg-white");
  if (css.backgroundColor === "#000000") classes.push("bg-black");

  return classes.join(" ");
}

// Helper: Convert CSS Object to React Inline Style string
function stylesToInline(css: Record<string, any>): string {
  if (Object.keys(css).length === 0) return "";
  // Removes undefined/null values
  const clean = Object.entries(css).reduce((acc, [k, v]) => {
    if (v !== undefined && v !== null && v !== "") acc[k] = v;
    return acc;
  }, {} as Record<string, any>);

  return `style={${JSON.stringify(clean)}}`;
}

// === The Recursive Engine ===
function renderNode(
  componentId: string,
  project: Project,
  designElements: DesignState["elements"],
  tech: TechStack
): string {
  const structure = project.components[componentId];
  const design = designElements[componentId];

  if (!structure || !design) return "";

  // 1. Get Children Code recursively
  const childrenCode = structure.children
    .map((childId) => renderNode(childId, project, designElements, tech))
    .join("\n");

  // 2. Determine Tag
  // You can expand this mapping based on component.type
  const tag =
    design.type === "button"
      ? "button"
      : design.type === "image"
      ? "img"
      : design.type === "input"
      ? "input"
      : "div";

  // 3. Generate Props/Attributes based on Stack
  if (tech === "react-tailwind") {
    const twClasses = stylesToTailwind(design.cssProperties || {});
    const inlineStyles = stylesToInline(design.cssProperties || {});

    // For self-closing tags
    if (tag === "img" || tag === "input") {
      return `<${tag} className="${twClasses}" ${inlineStyles} />`;
    }

    return `
      <${tag} className="${twClasses}" ${inlineStyles}>
        ${childrenCode}
      </${tag}>
    `;
  }

  // Fallback for HTML
  return `<div>${childrenCode}</div>`;
}

// === Main Export Function ===
export function generateExport(
  project: Project,
  designState: DesignState, // <--- You must pass this now!
  tech: TechStack = "react-tailwind"
): ExportResult {
  // 1. Find Root Components
  const allChildren = new Set(
    Object.values(project.components).flatMap((c) => c.children)
  );
  const roots = Object.values(project.components).filter(
    (c) => !allChildren.has(c.id)
  );

  // 2. Generate Tree
  const bodyCode = roots
    .map((root) => renderNode(root.id, project, designState.elements, tech))
    .join("\n");

  // 3. Wrap in Boilerplate
  const code = `
import React from "react";

export default function ExportedPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      ${bodyCode}
    </div>
  );
}
  `;

  return {
    fileName: "ExportedPage.tsx",
    code: code.trim(),
  };
}
