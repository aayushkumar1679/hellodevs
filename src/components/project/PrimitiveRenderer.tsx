/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

interface PrimitiveRendererProps {
  type: string;
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
      
      // If we are in the builder, we might want to avoid full NextImage optimization 
      // sometimes, but for "World Class Polish", let's use it.
      // However, NextImage requires width/height or fill.
      // Since our builder uses CSS for width/height, we should use 'fill' if they are present in style,
      // or just a standard img if things get complex.
      // For now, let's use a standard img but optimized styles.
      return (
        <img
          src={src}
          alt={alt}
          style={{
            ...baseStyle,
            objectFit: (props.objectFit as React.CSSProperties["objectFit"]) || "cover",
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
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
            <a href={brand?.href || "#"} style={{ fontWeight: 800, fontSize: "1.25rem" }}>
              {brand?.text || "Polyglot"}
            </a>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {links.map((link, i) => (
                <a key={i} href={link.href || "#"} style={{ fontSize: "0.875rem", opacity: 0.7 }}>
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
              }}
            >
              {cta.text}
            </a>
          )}
          {children}
        </nav>
      );
    }

    /* 
       NOTE: Complex components (pricing-card, product-card, cta, feature, testimonial)
       have been converted to BLUEPRINTS in the registry. 
       They no longer need custom rendering here.
    */

    default:
      return <div style={baseStyle}>{children}</div>;
  }
}
