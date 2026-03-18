import type { PolyglotProject, PolyglotComponent } from "@/state/useProjectStore";
import type { Breakpoint } from "@/state/useEditorStore";
import DesignerStyles from "@/utils/designerStyles";

/**
 * Shared utility for normalizing project components and their order.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProject(raw: any): { 
  components: Record<string, PolyglotComponent>; 
  rootOrder: string[] 
} {
  const components: Record<string, PolyglotComponent> = {};
  const rootOrder: string[] = Array.isArray(raw.rootOrder) ? raw.rootOrder : [];

  if (raw.components && typeof raw.components === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(raw.components).forEach(([id, c]: [string, any]) => {
      components[id] = {
        id: c.id || id,
        type: c.type || "section",
        children: Array.isArray(c.children) ? c.children : [],
        props: c.props || {},
        cssOverrides: c.cssOverrides || { base: {} },
        animations: Array.isArray(c.animations) ? c.animations : [],
        assets: Array.isArray(c.assets) ? c.assets : [],
        meta: c.meta || {},
      };
    });
  }

  return { components, rootOrder };
}

/**
 * Normalizes project data for consistent structure across versions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProjectData(raw: any): PolyglotProject {
  const { components, rootOrder } = normalizeProject(raw);
  
  return {
    id: typeof raw.id === "string" ? raw.id : "default-project",
    name: typeof raw.name === "string" ? raw.name : "Untitled",
    components,
    rootOrder,
    rootComponent:
      typeof raw.rootComponent === "string" ? raw.rootComponent : rootOrder[0] ?? null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    generationPrompt:
      typeof raw.generationPrompt === "string" ? raw.generationPrompt : undefined,
    generationModel:
      typeof raw.generationModel === "string" ? raw.generationModel : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generationSummary: typeof (raw as any).generationSummary === "string" ? (raw as any).generationSummary : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assets: Array.isArray((raw as any).assets) ? (raw as any).assets : [],
  };
}

/**
 * Backward compatibility helper for root IDs.
 */
export function getProjectRootIds(project: PolyglotProject): string[] {
  return project.rootOrder || [];
}

/**
 * Backward compatibility helper for breakpoint CSS.
 */
export function getBreakpointCss(
  component: PolyglotComponent,
  breakpoint: Breakpoint
): React.CSSProperties {
  return DesignerStyles.resolveForBreakpoint(component.cssOverrides, breakpoint);
}
