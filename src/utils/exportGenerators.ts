import type { Project } from "@/state/useCanvasStore";
import type { Element } from "@/state/useDesignStore";
import {
  generateHtmlPageCode,
  generateReactPageCode,
} from "@/utils/projectRenderer";

export type TechStack = "react-tailwind" | "react-bootstrap" | "html-css";

export interface ExportResult {
  fileName: string;
  code: string;
}

type DesignElements = Record<string, Element>;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateExport(
  project: Project,
  tech: TechStack,
  designElements: DesignElements = {}
): ExportResult {
  switch (tech) {
    case "react-bootstrap":
      return {
        fileName: `${slugify(project.name) || "page"}-react-bootstrap.tsx`,
        code: generateReactPageCode(project, designElements, "bootstrap"),
      };
    case "html-css":
      return {
        fileName: `${slugify(project.name) || "page"}.html`,
        code: generateHtmlPageCode(project, designElements),
      };
    case "react-tailwind":
    default:
      return {
        fileName: `${slugify(project.name) || "page"}-react-tailwind.tsx`,
        code: generateReactPageCode(project, designElements, "tailwind"),
      };
  }
}
