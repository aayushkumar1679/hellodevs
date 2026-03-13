import type { Project } from "@/state/useCanvasStore";
import type { Element } from "@/state/useDesignStore";

type DesignElements = Record<string, Element>;

interface FileRecord {
  name: string;
  content: string;
}

/**
 * Maps CSS properties to Tailwind classes where possible.
 * FALLBACK: If no direct mapping exists, it returns an inline style.
 */
function cssToTailwind(css: Record<string, any>): { classes: string[]; styles: Record<string, any> } {
  const classes: string[] = [];
  const styles: Record<string, any> = {};

  Object.entries(css).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    // Simple mappings
    switch (key) {
      case "backgroundColor":
        if (value.startsWith("#") || value.startsWith("rgb")) {
          classes.push(`bg-[${value}]`);
        }
        break;
      case "color":
        if (value.startsWith("#") || value.startsWith("rgb")) {
          classes.push(`text-[${value}]`);
        }
        break;
      case "padding":
      case "paddingTop":
      case "paddingRight":
      case "paddingBottom":
      case "paddingLeft":
      case "margin":
      case "marginTop":
      case "marginRight":
      case "marginBottom":
      case "marginLeft":
      case "width":
      case "height":
      case "borderRadius":
      case "fontSize":
      case "fontWeight":
      case "opacity":
        // For arbitrary values, Tailwind uses [value]
        const prefix = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        // Simplified mapping for common prefixes
        const tailwindPrefix = {
          padding: "p",
          paddingTop: "pt",
          paddingRight: "pr",
          paddingBottom: "pb",
          paddingLeft: "pl",
          margin: "m",
          marginTop: "mt",
          marginRight: "mr",
          marginBottom: "mb",
          marginLeft: "ml",
          width: "w",
          height: "h",
          borderRadius: "rounded",
          fontSize: "text",
          fontWeight: "font",
          opacity: "opacity",
        }[key];
        
        if (tailwindPrefix) {
          classes.push(`${tailwindPrefix}-[${value}]`);
        } else {
          styles[key] = value;
        }
        break;
      case "display":
        if (value === "flex") classes.push("flex");
        if (value === "grid") classes.push("grid");
        if (value === "block") classes.push("block");
        break;
      case "flexDirection":
        if (value === "row") classes.push("flex-row");
        if (value === "column") classes.push("flex-col");
        break;
      case "justifyContent":
        const justifyMap: Record<string, string> = {
          "flex-start": "justify-start",
          "flex-end": "justify-end",
          center: "justify-center",
          "space-between": "justify-between",
          "space-around": "justify-around",
          "space-evenly": "justify-evenly",
        };
        if (justifyMap[value]) classes.push(justifyMap[value]);
        break;
      case "alignItems":
        const alignMap: Record<string, string> = {
          "flex-start": "items-start",
          "flex-end": "items-end",
          center: "items-center",
          baseline: "items-baseline",
          stretch: "items-stretch",
        };
        if (alignMap[value]) classes.push(alignMap[value]);
        break;
      default:
        styles[key] = value;
    }
  });

  return { classes, styles };
}

function renderComponent(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level: number
): string {
  const component = project.components[componentId];
  if (!component) return "";

  const design = designElements[componentId] || {};
  const baseAttr = cssToTailwind(design.cssProperties?.base || {});
  const tabletAttr = cssToTailwind(design.cssProperties?.tablet || {});
  const mobileAttr = cssToTailwind(design.cssProperties?.mobile || {});

  // Combine classes with responsive prefixes
  const finalClasses = [
    ...baseAttr.classes,
    ...tabletAttr.classes.map((c) => `md:${c}`),
    ...mobileAttr.classes.map((c) => `sm:${c}`),
  ];

  const props = component.props || {};
  const styleObj = {
    ...baseAttr.styles,
    // Add more granular style merging if needed
  };

  const className = finalClasses.length > 0 ? ` className="${finalClasses.join(" ")}"` : "";
  const style = Object.keys(styleObj).length > 0 ? ` style={${JSON.stringify(styleObj)}}` : "";
  const indent = "  ".repeat(level);

  const renderChildren = () => 
    component.children
      .map((childId) => renderComponent(childId, project, designElements, level + 1))
      .join("\n");

  switch (component.type) {
    case "section":
      return `${indent}<section${className}${style}>\n${renderChildren()}\n${indent}</section>`;
    case "container":
      return `${indent}<div${className}${style} className="container mx-auto ${finalClasses.join(" ")}">\n${renderChildren()}\n${indent}</div>`;
    case "heading": {
      const tag = `h${props.level || 2}`;
      return `${indent}<${tag}${className}${style}>${props.text || "Heading"}</${tag}>`;
    }
    case "text":
      return `${indent}<p${className}${style}>${props.text || "Text content"}</p>`;
    case "button":
      return `${indent}<button${className}${style}>${props.text || "Click me"}</button>`;
    case "image":
      return `${indent}<img src="${props.src || ""}" alt="${props.alt || ""}"${className}${style} />`;
    case "navbar":
      return `${indent}<nav${className}${style} className="flex items-center justify-between p-4 ${finalClasses.join(" ")}">\n${renderChildren()}\n${indent}</nav>`;
    default:
      return `${indent}<div${className}${style}>\n${renderChildren()}\n${indent}</div>`;
  }
}

export function generateNextJsProject(project: Project, designElements: DesignElements): FileRecord[] {
  const compName = project.name.replace(/[^a-zA-Z0-9]/g, "") || "GeneratedPage";
  const roots = (project.rootOrder || [])
    .map((id) => renderComponent(id, project, designElements, 3))
    .join("\n");

  const pageContent = `"use client";

import React from "react";

export default function ${compName}() {
  return (
    <main className="min-h-screen">
${roots}
    </main>
  );
}
`;

  return [
    {
      name: "package.json",
      content: JSON.stringify({
        name: "polyglot-export",
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint"
        },
        dependencies: {
          "react": "^18",
          "react-dom": "^18",
          "next": "14.1.0",
          "lucide-react": "^0.344.0",
          "framer-motion": "^11.0.8",
          "clsx": "^2.1.0",
          "tailwind-merge": "^2.2.1"
        },
        devDependencies: {
          "typescript": "^5",
          "@types/node": "^20",
          "@types/react": "^18",
          "@types/react-dom": "^18",
          "postcss": "^8",
          "tailwindcss": "^3.4.1",
          "eslint": "^8",
          "eslint-config-next": "14.1.0"
        }
      }, null, 2)
    },
    {
      name: "tailwind.config.ts",
      content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
`
    },
    {
      name: "src/app/page.tsx",
      content: pageContent
    },
    {
      name: "src/app/layout.tsx",
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${project.name}",
  description: "Generated by Polyglot AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
    },
    {
      name: "src/app/globals.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: white;
}
`
    }
  ];
}
