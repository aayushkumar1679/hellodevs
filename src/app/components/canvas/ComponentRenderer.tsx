/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";

interface ComponentRendererProps {
  component: {
    id: string;
    type: string;
    props?: Record<string, unknown>;
  };
}

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

export default function ComponentRenderer({
  component,
}: ComponentRendererProps) {
  const definition = COMPONENT_LIBRARY.find((item) => item.type === component.type);
  const props = {
    ...definition?.defaultProps,
    ...component.props,
  };

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

  switch (component.type) {
    case "heading": {
      const level = Math.min(Math.max(Number(props.level ?? 2), 1), 6);
      return React.createElement(
        `h${level}`,
        {
          style: {
            ...baseStyle,
            fontWeight: "inherit",
          },
        },
        String(props.text ?? "Heading")
      );
    }
    case "text":
      return <p style={baseStyle}>{String(props.text ?? "Text")}</p>;
    case "button":
      return (
        <button
          type="button"
          style={{
            ...baseStyle,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",
            borderRadius: "inherit",
            padding: "inherit",
          }}
        >
          {String(props.text ?? "Button")}
        </button>
      );
    case "navbar": {
      const links = (Array.isArray(props.links) ? props.links : []) as Array<{
        label?: string;
      }>;

      return (
        <div
          style={{
            ...baseStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <strong>{String(props.brand && typeof props.brand === "object" && "text" in props.brand ? props.brand.text : "Polyglot")}</strong>
          <div style={{ display: "flex", gap: "inherit", opacity: 0.8, fontSize: "0.9em" }}>
            {links.slice(0, 3).map((link, index) => (
              <span key={`${component.id}-link-${index}`}>
                {String(link.label ?? "Link")}
              </span>
            ))}
          </div>
        </div>
      );
    }
    case "feature":
      return (
        <div style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <strong>{String(props.title ?? "Feature title")}</strong>
          <p style={{ margin: 0 }}>{String(props.text ?? "Feature description")}</p>
        </div>
      );
    case "testimonial":
      return (
        <div style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ margin: 0 }}>{String(props.quote ?? "Customer quote")}</p>
          <small style={{ opacity: 0.7 }}>
            {String(props.author ?? "Customer")}
            {props.role ? `, ${String(props.role)}` : ""}
          </small>
        </div>
      );
    case "pricing-card":
      return (
        <div style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <strong>{String(props.title ?? "Plan")}</strong>
          <p style={{ margin: 0 }}>
            {String(props.price ?? "$0")}
            {props.period ? ` / ${String(props.period)}` : ""}
          </p>
        </div>
      );
    case "product-card":
      return (
        <div style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <strong>{String(props.title ?? "Product")}</strong>
          <p style={{ margin: 0 }}>{String(props.price ?? "$0")}</p>
        </div>
      );
    case "cta":
      return (
        <div style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>{String(props.text ?? "Ready to build?")}</h2>
          {props.cta && typeof props.cta === "object" && "text" in props.cta ? (
            <button
              type="button"
              style={{
                alignSelf: "center",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                background: "currentColor",
                color: "white",
                filter: "invert(1)",
                fontWeight: 600,
              }}
            >
              {String(props.cta.text)}
            </button>
          ) : null}
        </div>
      );
    case "image":
      return props.src ? (
        <img
          src={String(props.src)}
          alt={String(props.alt ?? "")}
          style={{
            ...baseStyle,
            objectFit:
              (typeof props.objectFit === "string"
                ? props.objectFit
                : "cover") as React.CSSProperties["objectFit"],
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
          {String(props.text ?? "Badge")}
        </span>
      );
    case "input":
      return (
        <input
          readOnly
          placeholder={String(props.placeholder ?? "")}
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
          readOnly
          placeholder={String(props.placeholder ?? "")}
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
    case "alert":
      return (
        <div style={{ ...baseStyle, fontStyle: "italic" }}>
          {String(props.text ?? "Alert")}
        </div>
      );
    default:
      return (
        <div style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>
          {component.type} Component
        </div>
      );
  }
}
