import type { PolyglotProject } from "@/state/useProjectStore";
import {
  generateHtmlPageCode,
  generateReactPageCode,
} from "@/utils/projectRenderer";

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

export function generateExport(
  project: PolyglotProject,
  tech: TechStack
): ExportResult {
  switch (tech) {
    case "react-bootstrap":
      return {
        fileName: `${slugify(project.name) || "page"}-react-bootstrap.tsx`,
        code: generateReactPageCode(project, "bootstrap"),
      };
    case "html-css":
      return {
        fileName: `${slugify(project.name) || "page"}.html`,
        code: generateHtmlPageCode(project),
      };
    case "react-tailwind":
    default:
      return {
        fileName: `${slugify(project.name) || "page"}-react-tailwind.tsx`,
        code: generateReactPageCode(project, "tailwind"),
      };
  }
}
