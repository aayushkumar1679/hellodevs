"use client";

import React from "react";
import NextImage from "next/image";

interface PrimitiveRendererProps {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function PrimitiveRenderer({
  type,
  props = {},
  style = {},
  children,
}: PrimitiveRendererProps) {
  // Shared base styles to ensure consistency
  const baseStyle: React.CSSProperties = {
    boxSizing: "border-box",
    ...style,
  };

  switch (type) {
    case "heading": {
      const level = Math.min(Math.max(Number(props.level ?? 2), 1), 6);
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      return <Tag style={baseStyle}>{props.text ?? "Heading"}</Tag>;
    }

    case "text":
      return <p style={baseStyle}>{props.text ?? "Text"}</p>;

    case "button":
      return (
        <button type="button" style={baseStyle}>
          {props.text ?? "Button"}
        </button>
      );

    case "image": {
      const src = props.src || "https://images.unsplash.com/photo-1498050108023-c5249f4df085";
      const alt = props.alt || "Image";

      // Respect the incoming CSS styles (from designStore) for dimensions.
      // Only fallback to block display; don't override width/height if already set.
      const objectFit = (props.objectFit as React.CSSProperties["objectFit"]) || "cover";
      const imageStyle: React.CSSProperties = {
        position: "relative",
        display: "block",
        overflow: "hidden",
        ...baseStyle,
      };

      return (
        <div style={imageStyle}>
          <NextImage
            src={String(src)}
            alt={String(alt)}
            fill
            style={{ objectFit }}
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={process.env.NODE_ENV === "development"}
          />
        </div>
      );
    }

    case "badge":
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            backgroundColor: "rgba(0,0,0,0.05)",
            ...baseStyle,
          }}
        >
          {props.text ?? "Badge"}
        </span>
      );

    case "alert":
      return (
        <div
          role="alert"
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            ...baseStyle,
          }}
        >
          {props.text ?? "Alert"}
        </div>
      );

    case "divider":
      return (
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e2e8f0",
            margin: "1rem 0",
            ...baseStyle,
          }}
        />
      );

    case "spacer":
      return <div aria-hidden="true" style={{ height: "2rem", ...baseStyle }} />;

    case "navbar": {
      const links = (Array.isArray(props.links) ? props.links : []) as Array<{
        label?: string;
        href?: string;
      }>;
      const brand = props.brand as { text?: string; href?: string } | undefined;
      const cta = props.cta as { text?: string; href?: string } | undefined;

      return (
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            ...baseStyle,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <a href={brand?.href || "#"} style={{ fontWeight: 800, fontSize: "1.25rem", textDecoration: "none", color: "inherit" }}>
              {brand?.text || "Polyglot"}
            </a>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {links.map((link, i) => (
                <a key={i} href={link.href || "#"} style={{ fontSize: "0.875rem", opacity: 0.7, textDecoration: "none", color: "inherit" }}>
                  {link.label || "Link"}
                </a>
              ))}
            </div>
          </div>
          {cta?.text && (
            <a
              href={cta.href || "#"}
              style={{
                padding: "0.5rem 1.25rem",
                backgroundColor: "#0f172a",
                color: "white",
                borderRadius: "999px",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {cta.text}
            </a>
          )}
          {children}
        </nav>
      );
    }

    default:
      return <div style={baseStyle}>{children}</div>;
  }
}
