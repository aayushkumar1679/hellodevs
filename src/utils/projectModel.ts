import { COMPONENT_LIBRARY } from "@/config/componentRegistry";
import type { PolyglotProject, PolyglotComponent, CSSProperties } from "@/state/useProjectStore";
import type { Breakpoint } from "@/state/useEditorStore";

export function getProjectRootIds(project: Pick<PolyglotProject, "components" | "rootOrder">) {
  if (Array.isArray(project.rootOrder) && project.rootOrder.length > 0) {
    return project.rootOrder.filter((id) => Boolean(project.components[id]));
  }

  const childIds = new Set<string>();
  Object.values(project.components ?? {}).forEach((component) => {
    (component.children || []).forEach((childId) => childIds.add(childId));
  });

  return Object.values(project.components ?? {})
    .filter((component) => !childIds.has(component.id))
    .map((component) => component.id);
}

export function getBreakpointCss(
  component: PolyglotComponent | undefined,
  breakpoint: Breakpoint = "desktop"
): React.CSSProperties {
  if (!component) {
    return {};
  }

  const { base, tablet, mobile } = component.cssOverrides;
  const merged: CSSProperties =
    breakpoint === "mobile"
      ? { ...base, ...(tablet ?? {}), ...(mobile ?? {}) }
      : breakpoint === "tablet"
      ? { ...base, ...(tablet ?? {}) }
      : { ...base };

  return Object.fromEntries(
    Object.entries(merged).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  ) as React.CSSProperties;
}

export function normalizeProject(project: any): PolyglotProject {
  const components: Record<string, PolyglotComponent> = {};
  Object.entries(project.components ?? {}).forEach(([id, c]: [string, any]) => {
    components[id] = {
      id,
      type: c.type,
      props: c.props ?? {},
      children: Array.isArray(c.children) ? c.children : [],
      cssOverrides: c.cssOverrides ?? c.cssProperties ?? { base: {} }, // Fallback to handle old shapes
      animations: c.animations ?? [],
      assets: c.assets ?? [],
      meta: c.meta ?? {},
    };
    
    // Attempt to merge old designElements if they exist in the project payload
    if (project.designElements && project.designElements[id]) {
        const d = project.designElements[id];
        components[id].cssOverrides = d.cssProperties || { base: {} };
    }
  });

  const rootOrder = getProjectRootIds({
    components,
    rootOrder: Array.isArray(project.rootOrder) ? project.rootOrder : [],
  });

  return {
    id: project.id,
    name: project.name,
    components,
    rootOrder,
    rootComponent: project.rootComponent ?? rootOrder[0] ?? null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    generationPrompt: project.generationPrompt,
    generationModel: project.generationModel,
    generationSummary: project.generationSummary,
  };
}
