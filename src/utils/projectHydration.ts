import type { CanvasComponent } from "@/state/useCanvasStore";
import type { Element } from "@/state/useDesignStore";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";
import type { BlueprintNode } from "@/config/componentRegistry";

export interface GeneratedComponentNode {
  type: string;
  props?: Record<string, unknown>;
  css?: Record<string, unknown>;
  children?: GeneratedComponentNode[];
}

export interface GeneratedProjectPayload {
  projectName?: string;
  summary?: string;
  roots: GeneratedComponentNode[];
}

interface MaterializedProject {
  components: Record<string, CanvasComponent>;
  rootOrder: string[];
  designElements: Record<string, Element>;
}

const DEFAULT_COMPONENT_TYPE = "section";

function getDefinition(type: string) {
  return (
    COMPONENT_LIBRARY.find((component) => component.type === type) ||
    COMPONENT_LIBRARY.find((component) => component.type === DEFAULT_COMPONENT_TYPE)
  );
}

function expandBlueprint(
  blueprint: BlueprintNode,
  overrides: GeneratedComponentNode
): GeneratedComponentNode {
  return {
    type: blueprint.type,
    props: {
      ...(blueprint.props || {}),
      ...(overrides.props || {}),
    },
    css: {
      ...(blueprint.css || {}),
      ...(overrides.css || {}),
    },
    children: (blueprint.children || []).map((child) =>
      expandBlueprint(child, { type: child.type })
    ),
  };
}

function nextId(counter: { current: number }) {
  counter.current += 1;
  return `component-${Date.now()}-${counter.current}`;
}

function materializeNode(
  node: GeneratedComponentNode,
  counter: { current: number },
  components: Record<string, CanvasComponent>,
  designElements: Record<string, Element>
): string {
  const definition = getDefinition(node.type);
  const resolvedNode =
    definition?.blueprint != null
      ? expandBlueprint(definition.blueprint, node)
      : node;
  const resolvedDefinition = getDefinition(resolvedNode.type);
  const type = resolvedDefinition?.type || DEFAULT_COMPONENT_TYPE;
  const id = nextId(counter);

  components[id] = {
    id,
    type,
    props: {
      ...(resolvedDefinition?.defaultProps
        ? { ...resolvedDefinition.defaultProps }
        : {}),
      ...(resolvedNode.props || {}),
    },
    children: [],
  };

  designElements[id] = {
    id,
    type,
    cssProperties: {
      base: {
        ...(resolvedDefinition?.defaultCss
          ? { ...resolvedDefinition.defaultCss }
          : {}),
        ...(resolvedNode.css || {}),
      },
    },
  };

  const children = resolvedNode.children || [];
  components[id].children = children.map((child) =>
    materializeNode(child, counter, components, designElements)
  );

  return id;
}

export function materializeGeneratedProject(
  payload: GeneratedProjectPayload
): MaterializedProject {
  const components: Record<string, CanvasComponent> = {};
  const designElements: Record<string, Element> = {};
  const counter = { current: 0 };

  const rootOrder = payload.roots.map((node) =>
    materializeNode(node, counter, components, designElements)
  );

  return {
    components,
    rootOrder,
    designElements,
  };
}
