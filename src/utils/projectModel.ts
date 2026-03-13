import type { CSSProperties as ReactCssProperties } from "react";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";
import type { Project, CanvasComponent } from "@/state/useCanvasStore";
import type { Breakpoint, Element, ResponsiveCss } from "@/state/useDesignStore";

type CssRecord = Record<string, unknown>;

function getComponentDefinition(type: string) {
  return COMPONENT_LIBRARY.find((component) => component.type === type);
}

function createDefaultResponsiveCss(
  initialCss: CssRecord = {}
): ResponsiveCss {
  return {
    base: {
      display: "block",
      padding: "10px",
      margin: "0",
      ...initialCss,
    },
  };
}

export function createElementRecord(
  id: string,
  type: string,
  initialCss: CssRecord = {}
): Element {
  return {
    id,
    type,
    cssProperties: createDefaultResponsiveCss(initialCss),
  };
}

export function getProjectRootIds(project: Pick<Project, "components" | "rootOrder">) {
  if (Array.isArray(project.rootOrder) && project.rootOrder.length > 0) {
    return project.rootOrder.filter((id) => Boolean(project.components[id]));
  }

  const childIds = new Set<string>();
  Object.values(project.components ?? {}).forEach((component) => {
    component.children.forEach((childId) => childIds.add(childId));
  });

  return Object.values(project.components ?? {})
    .filter((component) => !childIds.has(component.id))
    .map((component) => component.id);
}

export function normalizeProject(project: Project): Project {
  const components: Record<string, CanvasComponent> = {};
  Object.entries(project.components ?? {}).forEach(([id, component]) => {
    components[id] = {
      id,
      type: component.type,
      props: component.props ?? {},
      children: Array.isArray(component.children) ? component.children : [],
    };
  });

  const rootOrder = getProjectRootIds({
    components,
    rootOrder: Array.isArray(project.rootOrder) ? project.rootOrder : [],
  });

  const designElements: Record<string, Element> = {};
  Object.values(components).forEach((component) => {
    const existing = project.designElements?.[component.id];
    if (existing) {
      designElements[component.id] = {
        ...existing,
        id: component.id,
        type: component.type,
        cssProperties: {
          base: {
            ...(existing.cssProperties?.base ?? {}),
          },
          ...(existing.cssProperties?.tablet
            ? { tablet: { ...existing.cssProperties.tablet } }
            : {}),
          ...(existing.cssProperties?.mobile
            ? { mobile: { ...existing.cssProperties.mobile } }
            : {}),
        },
      };
      return;
    }

    const definition = getComponentDefinition(component.type);
    designElements[component.id] = createElementRecord(
      component.id,
      component.type,
      definition?.defaultCss ?? {}
    );
  });

  return {
    ...project,
    components,
    designElements,
    rootOrder,
    rootComponent: project.rootComponent ?? rootOrder[0] ?? null,
  };
}

export function getBreakpointCss(
  element: Element | undefined,
  breakpoint: Breakpoint = "desktop"
): ReactCssProperties {
  if (!element) {
    return {};
  }

  const { base, tablet, mobile } = element.cssProperties;
  const merged: CssRecord =
    breakpoint === "mobile"
      ? { ...base, ...(tablet ?? {}), ...(mobile ?? {}) }
      : breakpoint === "tablet"
      ? { ...base, ...(tablet ?? {}) }
      : { ...base };

  return Object.fromEntries(
    Object.entries(merged).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  ) as ReactCssProperties;
}

export function mergeProjectDesignElements(
  project: Project,
  elements: Record<string, Element>
) {
  const normalizedProject = normalizeProject(project);
  const merged: Record<string, Element> = {};

  Object.values(normalizedProject.components).forEach((component) => {
    merged[component.id] =
      elements[component.id] ??
      normalizedProject.designElements[component.id] ??
      createElementRecord(component.id, component.type);
  });

  return merged;
}
