"use client";

import React from "react";
import type { PolyglotProject } from "@/state/useProjectStore";
import { renderProjectTreeToReact } from "@/utils/projectRenderer";

interface ProjectSurfaceProps {
  project: PolyglotProject;
  className?: string;
}

export default function ProjectSurface({
  project,
  className = "",
}: ProjectSurfaceProps) {
  return <div className={className}>{renderProjectTreeToReact(project)}</div>;
}
