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
-------------------------------------------------- */

const baseStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  font: "inherit",
  color: "inherit",
  lineHeight: "inherit",
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
     (Intentionally empty shells)
     =============================== */

  if (
    component.type === "section" ||
    component.type === "container" ||
    component.type === "flex-row" ||
    component.type === "flex-column" ||
    component.type === "grid" ||
    component.type === "card"
  ) {
    return (
      <div
        style={{
          ...baseStyle,
          minHeight: 40,
          borderRadius: 4,
        }}
      />
    );
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
            margin: 0,
            padding: 0,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          } as React.CSSProperties,
        },
        props.text ?? "Heading"
      );
    }

    case "text":
      return (
        <p
          style={{
            ...baseStyle,
            margin: 0,
            padding: 0,
            opacity: props.text ? 1 : 0.6,
          }}
        >
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
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid currentColor",
            background: "transparent",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {props.text ?? "Button"}
        </button>
      );

    /* ===============================
       Media
       =============================== */

    case "image":
      return props.src ? (
        <img
          src={props.src}
          alt={props.alt || ""}
          style={{
            ...baseStyle,
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            ...baseStyle,
            height: 120,
            background: "rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#888",
            borderRadius: 4,
          }}
        >
          Image
        </div>
      );

    /* ===============================
       Form
       =============================== */

    case "input":
      return (
        <input
          placeholder={props.placeholder}
          style={{
            ...baseStyle,
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            outline: "none",
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
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
      );

    /* ===============================
       Feedback
       =============================== */

    case "badge":
      return (
        <span
          style={{
            display: "inline-block",
            boxSizing: "border-box",
            padding: "2px 6px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            lineHeight: "1.2",
            background: "rgba(0,0,0,0.08)",
          }}
        >
          {props.text ?? "Badge"}
        </span>
      );

    case "alert":
      return (
        <div
          style={{
            ...baseStyle,
            padding: "8px 10px",
            borderRadius: 4,
            background: "rgba(255,0,0,0.05)",
            border: "1px solid rgba(255,0,0,0.2)",
            fontSize: 13,
          }}
        >
          {props.text ?? "Alert message"}
        </div>
      );

    /* ===============================
       Fallback
       =============================== */

    default:
      return (
        <div
          style={{
            fontSize: 12,
            color: "#999",
            fontStyle: "italic",
            padding: "4px 0",
          }}
        >
          Unknown component: {component.type}
        </div>
      );
  }
}
