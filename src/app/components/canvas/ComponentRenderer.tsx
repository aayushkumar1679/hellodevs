"use client";

import React from "react";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";
import PrimitiveRenderer from "@/components/project/PrimitiveRenderer";

interface ComponentRendererProps {
  component: {
    id: string;
    type: string;
    props?: Record<string, unknown>;
  };
}

export default function ComponentRenderer({
  component,
}: ComponentRendererProps) {
  const definition = COMPONENT_LIBRARY.find((item) => item.type === component.type);
  const props = {
    ...definition?.defaultProps,
    ...component.props,
  };

  // Layout components are rendered as containers by Canvas.tsx -> CanvasElement
  // ComponentRenderer only provides the "guts" for atoms.
  if (
    component.type === "section" ||
    component.type === "container" ||
    component.type === "flex-row" ||
    component.type === "flex-column" ||
    component.type === "grid" ||
    component.type === "card" ||
    component.type === "form" ||
    component.type === "divider" ||
    component.type === "spacer"
  ) {
    return null;
  }

  return (
    <PrimitiveRenderer
      type={component.type}
      props={props}
      style={{
        width: "100%",
        height: "100%",
        display: "inherit",
        alignItems: "inherit",
        justifyContent: "inherit",
      }}
    />
  );
}
