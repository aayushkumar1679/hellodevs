"use client";

import React from "react";
import type { Project } from "@/state/useCanvasStore";
import type { Element } from "@/state/useDesignStore";
import { renderProjectTreeToReact } from "@/utils/projectRenderer";

interface ProjectSurfaceProps {
  project: Project;
  designElements: Record<string, Element>;
  className?: string;
}

export default function ProjectSurface({
  project,
  designElements,
  className = "",
}: ProjectSurfaceProps) {
  return <div className={className}>{renderProjectTreeToReact(project, designElements)}</div>;
}
