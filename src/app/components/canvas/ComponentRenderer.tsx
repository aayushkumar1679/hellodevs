"use client";

import React from "react";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";

interface ComponentRendererProps {
  component: {
    id: string;
    type: string;
    props?: Record<string, any>;
  };
}

/* --------------------------------------------------
  Base render-safe style
  These styles ensure the component fits its container
  without overriding visual properties like color/bg.
-------------------------------------------------- */

const baseStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "none",
  margin: 0,
  padding: 0,
  lineHeight: "inherit",
  display: "inherit",
  alignItems: "inherit",
  justifyContent: "inherit",
};

/* --------------------------------------------------
  Component Renderer
-------------------------------------------------- */

export default function ComponentRenderer({
  component,
}: ComponentRendererProps) {
  const definition = COMPONENT_LIBRARY.find((c) => c.type === component.type);

  const props = {
    ...definition?.defaultProps,
    ...component.props,
  };

  /* ===============================
     Layout Components
     =============================== */

  if (
    component.type === "section" ||
    component.type === "container" ||
    component.type === "flex-row" ||
    component.type === "flex-column" ||
    component.type === "grid" ||
    component.type === "card" ||
    component.type === "form"
  ) {
    // These are layout shells; they rely entirely on CanvasElement styles
    return null; 
  }

  /* ===============================
     Content Components
     =============================== */

  switch (component.type) {
    case "heading": {
      const level = Math.min(Math.max(Number(props.level ?? 2), 1), 6);
      return React.createElement(
        `h${level}`,
        {
          style: {
            ...baseStyle,
            fontWeight: "inherit", // Inherit from container
          } as React.CSSProperties,
        },
        props.text ?? "Heading"
      );
    }

    case "text":
      return (
        <p style={baseStyle}>
          {props.text ?? "Text"}
        </p>
      );

    case "button":
      return (
        <button
          style={{
            ...baseStyle,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",
            borderRadius: "inherit", // Respect container's border radius
            padding: "inherit",      // Respect container's padding
          }}
        >
          {props.text ?? "Button"}
        </button>
      );

    case "navbar":
      return (
        <div
          style={{
            ...baseStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <strong>{props.brand?.text ?? "Polyglot"}</strong>
          <div style={{ display: "flex", gap: "inherit", opacity: 0.8, fontSize: "0.9em" }}>
            {(props.links ?? []).slice(0, 3).map((link: any, index: number) => (
              <span key={`${link?.label ?? "link"}-${index}`}>
                {link?.label ?? "Link"}
              </span>
            ))}
          </div>
        </div>
      );

    case "hero":
      return (
        <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
          <h1 style={{ margin: 0, fontSize: "2.5em", lineHeight: 1.1, fontWeight: 700 }}>
            {props.title ?? "Build better, faster."}
          </h1>
          <p style={{ margin: "1rem 0", fontSize: "1.1em", opacity: 0.8 }}>
            {props.subtitle ?? "A premium product page generated from your prompt."}
          </p>
        </div>
      );

    case "cta":
      return (
        <div style={{ ...baseStyle, textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5em", marginBottom: "1rem" }}>{props.text ?? "Ready to build?"}</h2>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "99px",
              background: "currentColor", // Interesting default
              color: "white", // Simplified
              filter: "invert(1)",
              border: "none",
              fontWeight: 600,
            }}
          >
            {props.cta?.text ?? "Start free"}
          </button>
        </div>
      );

    case "image":
      return props.src ? (
        <img
          src={props.src}
          alt={props.alt || ""}
          style={{
            ...baseStyle,
            objectFit: props.objectFit ?? "cover",
            display: "block",
            borderRadius: "inherit",
          }}
        />
      ) : (
        <div
          style={{
            ...baseStyle,
            height: "100%",
            background: "rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#888",
            borderRadius: "inherit",
          }}
        >
          Image
        </div>
      );

    case "badge":
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "99px",
            fontSize: "0.75em",
            fontWeight: 600,
            background: "rgba(0,0,0,0.1)",
          }}
        >
          {props.text ?? "Badge"}
        </span>
      );

    case "input":
      return (
        <input
          placeholder={props.placeholder}
          style={{
            ...baseStyle,
            padding: "0.5rem",
            borderRadius: "inherit",
            border: "1px solid rgba(0,0,0,0.1)",
            background: "white",
          }}
        />
      );

    case "textarea":
      return (
        <textarea
          placeholder={props.placeholder}
          style={{
            ...baseStyle,
            height: "100%",
            resize: "none",
            padding: "0.5rem",
            borderRadius: "inherit",
            border: "1px solid rgba(0,0,0,0.1)",
            background: "white",
          }}
        />
      );

    default:
      return (
        <div style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>
          {component.type} Component
        </div>
      );
  }
}
