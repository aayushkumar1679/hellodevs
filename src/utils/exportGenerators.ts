import type { Project } from "@/state/useCanvasStore";
import type { Element } from "@/state/useDesignStore";

export type TechStack = "react-tailwind" | "react-bootstrap" | "html-css";

export interface ExportResult {
  fileName: string;
  code: string;
}

type DesignElements = Record<string, Element>;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeName(name: string) {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "");
  return /^[A-Za-z]/.test(clean) ? clean : `Project${clean || "Page"}`;
}

function getRootIds(project: Project) {
  if (project.rootOrder?.length) {
    return project.rootOrder;
  }

  const childIds = new Set(
    Object.values(project.components).flatMap((component) => component.children)
  );

  return Object.values(project.components)
    .filter((component) => !childIds.has(component.id))
    .map((component) => component.id);
}

function getBaseCss(designElements: DesignElements, id: string) {
  return designElements[id]?.cssProperties?.base || {};
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toInlineStyle(css: Record<string, any>) {
  return Object.entries(css)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}:${String(value)}`;
    })
    .join(";");
}

function toJsxStyle(css: Record<string, any>) {
  const cleaned = Object.fromEntries(
    Object.entries(css).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  return Object.keys(cleaned).length > 0
    ? ` style={${JSON.stringify(cleaned)}}`
    : "";
}

function indent(text: string, level: number) {
  const padding = "  ".repeat(level);
  return text
    .split("\n")
    .map((line) => (line ? `${padding}${line}` : line))
    .join("\n");
}

function renderChildrenReact(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level: number,
  variant: "tailwind" | "bootstrap"
) {
  return project.components[componentId].children
    .map((childId) =>
      renderReactNode(childId, project, designElements, level, variant)
    )
    .join("\n");
}

function renderChildrenHtml(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level: number
) {
  return project.components[componentId].children
    .map((childId) => renderHtmlNode(childId, project, designElements, level))
    .join("\n");
}

function renderReactNode(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level = 3,
  variant: "tailwind" | "bootstrap" = "tailwind"
): string {
  const component = project.components[componentId];
  if (!component) return "";

  const css = getBaseCss(designElements, componentId);
  const props = component.props || {};
  const style = toJsxStyle(css);
  const className =
    variant === "tailwind" ? ' className="w-full"' : ' className="w-100"';
  const children = renderChildrenReact(
    componentId,
    project,
    designElements,
    level + 1,
    variant
  );

  switch (component.type) {
    case "section":
      return `${"  ".repeat(level)}<section${className}${style}>
${children}
${"  ".repeat(level)}</section>`;
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid":
      return `${"  ".repeat(level)}<div${className}${style}>
${children}
${"  ".repeat(level)}</div>`;
    case "card":
      return `${"  ".repeat(level)}<article${className}${style}>
${children}
${"  ".repeat(level)}</article>`;
    case "form":
      return `${"  ".repeat(level)}<form${className}${style}>
${children}
${"  ".repeat(level)}</form>`;
    case "heading": {
      const tag = `h${Math.min(Math.max(Number(props.level || 2), 1), 6)}`;
      return `${"  ".repeat(level)}<${tag}${style}>${props.text || "Heading"}</${tag}>`;
    }
    case "text":
      return `${"  ".repeat(level)}<p${style}>${props.text || "Text"}</p>`;
    case "button":
      return `${"  ".repeat(level)}<button${style}>${props.text || "Button"}</button>`;
    case "image":
      return `${"  ".repeat(level)}<img${style} src="${
        props.src || "https://images.pexels.com/photos/34088/pexels-photo.jpg"
      }" alt="${props.alt || "Image"}" />`;
    case "input":
      return `${"  ".repeat(level)}<input${style} placeholder="${
        props.placeholder || "Enter text"
      }" />`;
    case "textarea":
      return `${"  ".repeat(level)}<textarea${style} placeholder="${
        props.placeholder || "Write here"
      } />`;
    case "badge":
      return `${"  ".repeat(level)}<span${style}>${props.text || "Badge"}</span>`;
    case "alert":
      return `${"  ".repeat(level)}<div role="alert"${style}>${
        props.text || "Alert"
      }</div>`;
    case "navbar": {
      const brand = props.brand?.text || "Polyglot";
      const links = (props.links || []).map(
        (link: { label: string; href?: string }) =>
          `${"  ".repeat(level + 2)}<a href="${link.href || "#"}">${
            link.label || "Link"
          }</a>`
      );
      const cta = props.cta?.text
        ? `${"  ".repeat(level + 2)}<a href="${
            props.cta.href || "#"
          }">${props.cta.text}</a>`
        : "";

      return `${"  ".repeat(level)}<nav${className}${style}>
${"  ".repeat(level + 1)}<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
${"  ".repeat(level + 2)}<strong>${brand}</strong>
${"  ".repeat(level + 2)}<div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
${links.join("\n")}
${cta}
${"  ".repeat(level + 2)}</div>
${"  ".repeat(level + 1)}</div>
${"  ".repeat(level)}</nav>`;
    }
    case "feature":
      return `${"  ".repeat(level)}<div${style}>
${"  ".repeat(level + 1)}<h3>${props.title || "Feature title"}</h3>
${"  ".repeat(level + 1)}<p>${props.text || "Feature description"}</p>
${"  ".repeat(level)}</div>`;
    case "testimonial":
      return `${"  ".repeat(level)}<blockquote${style}>
${"  ".repeat(level + 1)}<p>"${props.quote || "Customer quote"}"</p>
${"  ".repeat(level + 1)}<footer>${props.author || "Customer"}${
        props.role ? `, ${props.role}` : ""
      }</footer>
${"  ".repeat(level)}</blockquote>`;
    case "pricing-card": {
      const features = (props.features || []).map(
        (feature: string) =>
          `${"  ".repeat(level + 2)}<li>${feature}</li>`
      );
      return `${"  ".repeat(level)}<div${style}>
${"  ".repeat(level + 1)}<h3>${props.title || "Plan"}</h3>
${"  ".repeat(level + 1)}<p>${props.price || "$0"}${
        props.period ? ` / ${props.period}` : ""
      }</p>
${"  ".repeat(level + 1)}<ul>
${features.join("\n")}
${"  ".repeat(level + 1)}</ul>
${"  ".repeat(level)}</div>`;
    }
    case "product-card":
      return `${"  ".repeat(level)}<div${style}>
${"  ".repeat(level + 1)}<img src="${
        props.image || "https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg"
      }" alt="${props.title || "Product"}" />
${"  ".repeat(level + 1)}<h3>${props.title || "Product"}</h3>
${"  ".repeat(level + 1)}<p>${props.price || "$0"}</p>
${"  ".repeat(level)}</div>`;
    case "spacer":
      return `${"  ".repeat(level)}<div aria-hidden="true"${style} />`;
    case "divider":
      return `${"  ".repeat(level)}<hr${style} />`;
    default:
      return `${"  ".repeat(level)}<div${className}${style}>
${children}
${"  ".repeat(level)}</div>`;
  }
}

function renderHtmlNode(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level = 2
): string {
  const component = project.components[componentId];
  if (!component) return "";

  const css = getBaseCss(designElements, componentId);
  const props = component.props || {};
  const style = toInlineStyle(css);
  const styleAttr = style ? ` style="${escapeHtml(style)}"` : "";
  const children = renderChildrenHtml(componentId, project, designElements, level + 1);

  switch (component.type) {
    case "section":
      return `${"  ".repeat(level)}<section${styleAttr}>
${children}
${"  ".repeat(level)}</section>`;
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid":
    case "card":
    case "form":
      return `${"  ".repeat(level)}<div${styleAttr}>
${children}
${"  ".repeat(level)}</div>`;
    case "heading": {
      const tag = `h${Math.min(Math.max(Number(props.level || 2), 1), 6)}`;
      return `${"  ".repeat(level)}<${tag}${styleAttr}>${escapeHtml(
        props.text || "Heading"
      )}</${tag}>`;
    }
    case "text":
      return `${"  ".repeat(level)}<p${styleAttr}>${escapeHtml(
        props.text || "Text"
      )}</p>`;
    case "button":
      return `${"  ".repeat(level)}<button${styleAttr}>${escapeHtml(
        props.text || "Button"
      )}</button>`;
    case "image":
      return `${"  ".repeat(level)}<img${styleAttr} src="${escapeHtml(
        props.src || "https://images.pexels.com/photos/34088/pexels-photo.jpg"
      )}" alt="${escapeHtml(props.alt || "Image")}" />`;
    case "input":
      return `${"  ".repeat(level)}<input${styleAttr} placeholder="${escapeHtml(
        props.placeholder || "Enter text"
      )}" />`;
    case "textarea":
      return `${"  ".repeat(level)}<textarea${styleAttr} placeholder="${escapeHtml(
        props.placeholder || "Write here"
      )}"></textarea>`;
    case "badge":
      return `${"  ".repeat(level)}<span${styleAttr}>${escapeHtml(
        props.text || "Badge"
      )}</span>`;
    case "alert":
      return `${"  ".repeat(level)}<div role="alert"${styleAttr}>${escapeHtml(
        props.text || "Alert"
      )}</div>`;
    case "spacer":
      return `${"  ".repeat(level)}<div aria-hidden="true"${styleAttr}></div>`;
    case "divider":
      return `${"  ".repeat(level)}<hr${styleAttr} />`;
    default:
      return `${"  ".repeat(level)}<div${styleAttr}>
${children}
${"  ".repeat(level)}</div>`;
  }
}

function generateReactTailwind(
  project: Project,
  designElements: DesignElements
): ExportResult {
  const compName = sanitizeName(project.name);
  const roots = getRootIds(project)
    .map((rootId) => renderReactNode(rootId, project, designElements))
    .join("\n");

  const code = `import React from "react";

export default function ${compName}() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.45)]">
${roots}
      </div>
    </main>
  );
}
`;

  return {
    fileName: `${slugify(project.name) || "page"}-react-tailwind.tsx`,
    code,
  };
}

function generateReactBootstrap(
  project: Project,
  designElements: DesignElements
): ExportResult {
  const compName = sanitizeName(project.name);
  const roots = getRootIds(project)
    .map((rootId) =>
      renderReactNode(rootId, project, designElements, 3, "bootstrap")
    )
    .join("\n");

  const code = `import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ${compName}() {
  return (
    <main className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="bg-white border rounded-4 shadow-sm p-4">
${roots}
        </div>
      </div>
    </main>
  );
}
`;

  return {
    fileName: `${slugify(project.name) || "page"}-react-bootstrap.tsx`,
    code,
  };
}

function generateHtmlCss(
  project: Project,
  designElements: DesignElements
): ExportResult {
  const body = getRootIds(project)
    .map((rootId) => renderHtmlNode(rootId, project, designElements))
    .join("\n");

  const code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(project.name)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      margin: 0;
      font-family: "Inter", "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: #0f172a;
      min-height: 100vh;
      padding: 40px 24px;
    }

    main {
      max-width: 1200px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 32px;
      box-shadow: 0 35px 80px -45px rgba(15, 23, 42, 0.45);
      padding: 24px;
    }

    img {
      max-width: 100%;
      display: block;
    }
  </style>
</head>
<body>
  <main>
${indent(body, 2)}
  </main>
</body>
</html>`;

  return {
    fileName: `${slugify(project.name) || "page"}.html`,
    code,
  };
}

export function generateExport(
  project: Project,
  tech: TechStack,
  designElements: DesignElements = {}
): ExportResult {
  switch (tech) {
    case "react-tailwind":
      return generateReactTailwind(project, designElements);
    case "react-bootstrap":
      return generateReactBootstrap(project, designElements);
    case "html-css":
    default:
      return generateHtmlCss(project, designElements);
  }
}
