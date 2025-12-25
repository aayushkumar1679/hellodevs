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
    component.type === "card"
  ) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "40px",
          boxSizing: "border-box",
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
            margin: 0,
            padding: 0,
            width: "100%",
            boxSizing: "border-box",
          },
        },
        props.text ?? "Heading"
      );
    }

    case "text":
      return (
        <p
          style={{
            margin: 0,
            padding: 0,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {props.text ?? "Text"}
        </p>
      );

    case "button":
      return (
        <button
          style={{
            margin: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          {props.text ?? "Button"}
        </button>
      );

    /* ===============================
       Media
       =============================== */

    case "image":
      return (
        <img
          src={props.src}
          alt={props.alt || ""}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            boxSizing: "border-box",
          }}
        />
      );

    /* ===============================
       Form
       =============================== */

    case "input":
      return (
        <input
          placeholder={props.placeholder}
          style={{
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      );

    case "textarea":
      return (
        <textarea
          placeholder={props.placeholder}
          style={{
            width: "100%",
            height: "100%",
            resize: "none",
            boxSizing: "border-box",
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
          }}
        >
          {props.text}
        </span>
      );

    case "alert":
      return (
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {props.text}
        </div>
      );

    default:
      return (
        <div
          style={{
            fontSize: 12,
            color: "#999",
            fontStyle: "italic",
          }}
        >
          Unknown component: {component.type}
        </div>
      );
  }
}
