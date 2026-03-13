/* eslint-disable @next/next/no-img-element */

import React from "react";
import type { Project } from "@/state/useCanvasStore";
import type { Breakpoint, Element } from "@/state/useDesignStore";
import {
  getBreakpointCss,
  getProjectRootIds,
} from "@/utils/projectModel";
import { POLYGLOT_MOTION_CSS } from "@/utils/motionStyles";

type DesignElements = Record<string, Element>;
type ExportVariant = "tailwind" | "bootstrap";
type LinkLike = { href?: string; label?: string };
type ActionLike = { href?: string; text?: string };
type BrandLike = { href?: string; text?: string };
type ComponentProps = Record<string, unknown> & {
  level?: number | string;
  text?: string | number;
  src?: string;
  alt?: string;
  placeholder?: string;
  objectFit?: React.CSSProperties["objectFit"];
  brand?: BrandLike;
  links?: LinkLike[];
  cta?: ActionLike;
  title?: string;
  quote?: string;
  author?: string;
  role?: string;
  price?: string;
  period?: string;
  features?: Array<string | number>;
  image?: string;
};

function sanitizeComponentName(name: string) {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "");
  return /^[A-Za-z]/.test(clean) ? clean : `Project${clean || "Page"}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function styleToJsx(style: React.CSSProperties) {
  const cleaned = Object.fromEntries(
    Object.entries(style).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  return Object.keys(cleaned).length > 0
    ? ` style={${JSON.stringify(cleaned)}}`
    : "";
}

function styleToHtml(style: React.CSSProperties) {
  const css = Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      return `${cssKey}:${String(value)}`;
    })
    .join(";");

  return css ? ` style="${escapeHtml(css)}"` : "";
}

function renderChildrenToReact(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  breakpoint: Breakpoint
) {
  return project.components[componentId].children.map((childId) =>
    renderProjectNodeToReact(childId, project, designElements, breakpoint)
  );
}

function renderChildrenToJsx(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level: number
) {
  return project.components[componentId].children
    .map((childId) =>
      renderProjectNodeToJsx(childId, project, designElements, level + 1)
    )
    .join("\n");
}

function renderChildrenToHtml(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level: number
) {
  return project.components[componentId].children
    .map((childId) =>
      renderProjectNodeToHtml(childId, project, designElements, level + 1)
    )
    .join("\n");
}

function indent(level: number) {
  return "  ".repeat(level);
}

function getNodeState(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  breakpoint: Breakpoint
) {
  const component = project.components[componentId];
  const design = designElements[componentId];

  return {
    component,
    props: (component.props ?? {}) as ComponentProps,
    style: getBreakpointCss(design, breakpoint),
  };
}

export function renderProjectNodeToReact(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  breakpoint: Breakpoint = "desktop"
): React.ReactNode {
  const { component, props, style } = getNodeState(
    componentId,
    project,
    designElements,
    breakpoint
  );

  if (!component) {
    return null;
  }

  const children = renderChildrenToReact(
    componentId,
    project,
    designElements,
    breakpoint
  );

  switch (component.type) {
    case "section":
      return (
        <section key={componentId} style={style}>
          {children}
        </section>
      );
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid":
      return (
        <div key={componentId} style={style}>
          {children}
        </div>
      );
    case "card":
      return (
        <article key={componentId} style={style}>
          {children}
        </article>
      );
    case "form":
      return (
        <form key={componentId} style={style}>
          {children}
        </form>
      );
    case "heading": {
      const tag = `h${Math.min(Math.max(Number(props.level ?? 2), 1), 6)}`;
      return React.createElement(tag, { key: componentId, style }, props.text ?? "Heading");
    }
    case "text":
      return (
        <p key={componentId} style={style}>
          {props.text ?? "Text"}
        </p>
      );
    case "button":
      return (
        <button key={componentId} type="button" style={style}>
          {props.text ?? "Button"}
        </button>
      );
    case "image":
      return (
        <img
          key={componentId}
          src={String(props.src ?? "https://images.pexels.com/photos/34088/pexels-photo.jpg")}
          alt={String(props.alt ?? "Image")}
          style={style}
        />
      );
    case "input":
      return (
        <input
          key={componentId}
          readOnly
          placeholder={String(props.placeholder ?? "Enter text")}
          style={style}
        />
      );
    case "textarea":
      return (
        <textarea
          key={componentId}
          readOnly
          placeholder={String(props.placeholder ?? "Write something")}
          style={style}
        />
      );
    case "badge":
      return (
        <span key={componentId} style={style}>
          {props.text ?? "Badge"}
        </span>
      );
    case "alert":
      return (
        <div key={componentId} role="alert" style={style}>
          {props.text ?? "Alert"}
        </div>
      );
    case "divider":
      return <hr key={componentId} style={style} />;
    case "spacer":
      return <div key={componentId} aria-hidden="true" style={style} />;
    case "navbar":
      return (
        <nav key={componentId} style={style}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <a href={String(props.brand?.href ?? "#")}>{String(props.brand?.text ?? "Polyglot")}</a>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {(Array.isArray(props.links) ? props.links : []).map((link, index) => {
                const item = link as { href?: string; label?: string };
                return (
                  <a key={`${componentId}-link-${index}`} href={String(item.href ?? "#")}>
                    {String(item.label ?? "Link")}
                  </a>
                );
              })}
              {props.cta?.text ? (
                <a href={String(props.cta.href ?? "#")}>{String(props.cta.text)}</a>
              ) : null}
            </div>
          </div>
          {children}
        </nav>
      );
    case "feature":
      return (
        <div key={componentId} style={style}>
          <h3>{String(props.title ?? "Feature title")}</h3>
          <p>{String(props.text ?? "Feature description")}</p>
        </div>
      );
    case "testimonial":
      return (
        <blockquote key={componentId} style={style}>
          <p>{String(props.quote ?? "Customer quote")}</p>
          <footer>
            {String(props.author ?? "Customer")}
            {props.role ? `, ${String(props.role)}` : ""}
          </footer>
        </blockquote>
      );
    case "pricing-card":
      return (
        <article key={componentId} style={style}>
          <h3>{String(props.title ?? "Plan")}</h3>
          <p>
            {String(props.price ?? "$0")}
            {props.period ? ` / ${String(props.period)}` : ""}
          </p>
          <ul>
            {(Array.isArray(props.features) ? props.features : []).map((feature, index) => (
              <li key={`${componentId}-feature-${index}`}>{String(feature)}</li>
            ))}
          </ul>
          {props.cta?.text ? (
            <button type="button">{String(props.cta.text)}</button>
          ) : null}
        </article>
      );
    case "product-card":
      return (
        <article key={componentId} style={style}>
          <img
            src={String(props.image ?? "https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg")}
            alt={String(props.title ?? "Product")}
          />
          <h3>{String(props.title ?? "Product")}</h3>
          <p>{String(props.price ?? "$0")}</p>
          {props.cta?.text ? <button type="button">{String(props.cta.text)}</button> : null}
        </article>
      );
    case "cta":
      return (
        <section key={componentId} style={style}>
          <h2>{String(props.text ?? "Ready to build?")}</h2>
          {props.cta?.text ? <button type="button">{String(props.cta.text)}</button> : null}
          {children}
        </section>
      );
    default:
      return (
        <div key={componentId} style={style}>
          {children}
        </div>
      );
  }
}

export function renderProjectTreeToReact(
  project: Project,
  designElements: DesignElements,
  breakpoint: Breakpoint = "desktop"
) {
  return getProjectRootIds(project).map((rootId) =>
    renderProjectNodeToReact(rootId, project, designElements, breakpoint)
  );
}

function renderProjectNodeToJsx(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level = 3
): string {
  const { component, props, style } = getNodeState(
    componentId,
    project,
    designElements,
    "desktop"
  );

  if (!component) {
    return "";
  }

  const pad = indent(level);
  const styleAttr = styleToJsx(style);
  const children = renderChildrenToJsx(componentId, project, designElements, level);

  switch (component.type) {
    case "section":
      return `${pad}<section${styleAttr}>
${children}
${pad}</section>`;
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid":
      return `${pad}<div${styleAttr}>
${children}
${pad}</div>`;
    case "card":
      return `${pad}<article${styleAttr}>
${children}
${pad}</article>`;
    case "form":
      return `${pad}<form${styleAttr}>
${children}
${pad}</form>`;
    case "heading": {
      const tag = `h${Math.min(Math.max(Number(props.level ?? 2), 1), 6)}`;
      return `${pad}<${tag}${styleAttr}>${`{${JSON.stringify(String(props.text ?? "Heading"))}}`}</${tag}>`;
    }
    case "text":
      return `${pad}<p${styleAttr}>${`{${JSON.stringify(String(props.text ?? "Text"))}}`}</p>`;
    case "button":
      return `${pad}<button type="button"${styleAttr}>${`{${JSON.stringify(String(props.text ?? "Button"))}}`}</button>`;
    case "image":
      return `${pad}<img src={${JSON.stringify(String(props.src ?? "https://images.pexels.com/photos/34088/pexels-photo.jpg"))}} alt={${JSON.stringify(String(props.alt ?? "Image"))}}${styleAttr} />`;
    case "input":
      return `${pad}<input readOnly placeholder={${JSON.stringify(String(props.placeholder ?? "Enter text"))}}${styleAttr} />`;
    case "textarea":
      return `${pad}<textarea readOnly placeholder={${JSON.stringify(String(props.placeholder ?? "Write something"))}}${styleAttr} />`;
    case "badge":
      return `${pad}<span${styleAttr}>${`{${JSON.stringify(String(props.text ?? "Badge"))}}`}</span>`;
    case "alert":
      return `${pad}<div role="alert"${styleAttr}>${`{${JSON.stringify(String(props.text ?? "Alert"))}}`}</div>`;
    case "divider":
      return `${pad}<hr${styleAttr} />`;
    case "spacer":
      return `${pad}<div aria-hidden="true"${styleAttr} />`;
    case "navbar": {
      const links = (Array.isArray(props.links) ? props.links : [])
        .map((link) => {
          const item = link as { href?: string; label?: string };
          return `${indent(level + 3)}<a href={${JSON.stringify(String(item.href ?? "#"))}}>${`{${JSON.stringify(String(item.label ?? "Link"))}}`}</a>`;
        })
        .join("\n");

      const cta = props.cta?.text
        ? `${indent(level + 3)}<a href={${JSON.stringify(String(props.cta.href ?? "#"))}}>${`{${JSON.stringify(String(props.cta.text))}}`}</a>`
        : "";

      return `${pad}<nav${styleAttr}>
${indent(level + 1)}<div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"16px"}}>
${indent(level + 2)}<a href={${JSON.stringify(String(props.brand?.href ?? "#"))}}>${`{${JSON.stringify(String(props.brand?.text ?? "Polyglot"))}}`}</a>
${indent(level + 2)}<div style={{"display":"flex","alignItems":"center","gap":"16px"}}>
${links}
${cta}
${indent(level + 2)}</div>
${indent(level + 1)}</div>
${children}
${pad}</nav>`;
    }
    case "feature":
      return `${pad}<div${styleAttr}>
${indent(level + 1)}<h3>${`{${JSON.stringify(String(props.title ?? "Feature title"))}}`}</h3>
${indent(level + 1)}<p>${`{${JSON.stringify(String(props.text ?? "Feature description"))}}`}</p>
${pad}</div>`;
    case "testimonial":
      return `${pad}<blockquote${styleAttr}>
${indent(level + 1)}<p>${`{${JSON.stringify(String(props.quote ?? "Customer quote"))}}`}</p>
${indent(level + 1)}<footer>${`{${JSON.stringify(
        `${String(props.author ?? "Customer")}${props.role ? `, ${String(props.role)}` : ""}`
      )}}`}</footer>
${pad}</blockquote>`;
    case "pricing-card": {
      const features = (Array.isArray(props.features) ? props.features : [])
        .map(
          (feature, index) =>
            `${indent(level + 2)}<li key={${JSON.stringify(
              `${componentId}-feature-${index}`
            )}}>${`{${JSON.stringify(String(feature))}}`}</li>`
        )
        .join("\n");

      const cta = props.cta?.text
        ? `${indent(level + 1)}<button type="button">${`{${JSON.stringify(String(props.cta.text))}}`}</button>`
        : "";

      return `${pad}<article${styleAttr}>
${indent(level + 1)}<h3>${`{${JSON.stringify(String(props.title ?? "Plan"))}}`}</h3>
${indent(level + 1)}<p>${`{${JSON.stringify(
        `${String(props.price ?? "$0")}${props.period ? ` / ${String(props.period)}` : ""}`
      )}}`}</p>
${indent(level + 1)}<ul>
${features}
${indent(level + 1)}</ul>
${cta}
${pad}</article>`;
    }
    case "product-card":
      return `${pad}<article${styleAttr}>
${indent(level + 1)}<img src={${JSON.stringify(String(props.image ?? "https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg"))}} alt={${JSON.stringify(String(props.title ?? "Product"))}} />
${indent(level + 1)}<h3>${`{${JSON.stringify(String(props.title ?? "Product"))}}`}</h3>
${indent(level + 1)}<p>${`{${JSON.stringify(String(props.price ?? "$0"))}}`}</p>
${props.cta?.text ? `${indent(level + 1)}<button type="button">${`{${JSON.stringify(String(props.cta.text))}}`}</button>` : ""}
${pad}</article>`;
    case "cta":
      return `${pad}<section${styleAttr}>
${indent(level + 1)}<h2>${`{${JSON.stringify(String(props.text ?? "Ready to build?"))}}`}</h2>
${props.cta?.text ? `${indent(level + 1)}<button type="button">${`{${JSON.stringify(String(props.cta.text))}}`}</button>` : ""}
${children}
${pad}</section>`;
    default:
      return `${pad}<div${styleAttr}>
${children}
${pad}</div>`;
  }
}

function renderProjectNodeToHtml(
  componentId: string,
  project: Project,
  designElements: DesignElements,
  level = 2
): string {
  const { component, props, style } = getNodeState(
    componentId,
    project,
    designElements,
    "desktop"
  );

  if (!component) {
    return "";
  }

  const pad = indent(level);
  const styleAttr = styleToHtml(style);
  const children = renderChildrenToHtml(componentId, project, designElements, level);

  switch (component.type) {
    case "section":
      return `${pad}<section${styleAttr}>
${children}
${pad}</section>`;
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid":
      return `${pad}<div${styleAttr}>
${children}
${pad}</div>`;
    case "card":
      return `${pad}<article${styleAttr}>
${children}
${pad}</article>`;
    case "form":
      return `${pad}<form${styleAttr}>
${children}
${pad}</form>`;
    case "heading": {
      const tag = `h${Math.min(Math.max(Number(props.level ?? 2), 1), 6)}`;
      return `${pad}<${tag}${styleAttr}>${escapeHtml(String(props.text ?? "Heading"))}</${tag}>`;
    }
    case "text":
      return `${pad}<p${styleAttr}>${escapeHtml(String(props.text ?? "Text"))}</p>`;
    case "button":
      return `${pad}<button type="button"${styleAttr}>${escapeHtml(String(props.text ?? "Button"))}</button>`;
    case "image":
      return `${pad}<img src="${escapeHtml(String(props.src ?? "https://images.pexels.com/photos/34088/pexels-photo.jpg"))}" alt="${escapeHtml(String(props.alt ?? "Image"))}"${styleAttr} />`;
    case "input":
      return `${pad}<input readonly placeholder="${escapeHtml(String(props.placeholder ?? "Enter text"))}"${styleAttr} />`;
    case "textarea":
      return `${pad}<textarea readonly placeholder="${escapeHtml(String(props.placeholder ?? "Write something"))}"${styleAttr}></textarea>`;
    case "badge":
      return `${pad}<span${styleAttr}>${escapeHtml(String(props.text ?? "Badge"))}</span>`;
    case "alert":
      return `${pad}<div role="alert"${styleAttr}>${escapeHtml(String(props.text ?? "Alert"))}</div>`;
    case "divider":
      return `${pad}<hr${styleAttr} />`;
    case "spacer":
      return `${pad}<div aria-hidden="true"${styleAttr}></div>`;
    case "navbar": {
      const links = (Array.isArray(props.links) ? props.links : [])
        .map((link) => {
          const item = link as { href?: string; label?: string };
          return `${indent(level + 3)}<a href="${escapeHtml(String(item.href ?? "#"))}">${escapeHtml(String(item.label ?? "Link"))}</a>`;
        })
        .join("\n");

      const cta = props.cta?.text
        ? `${indent(level + 3)}<a href="${escapeHtml(String(props.cta.href ?? "#"))}">${escapeHtml(String(props.cta.text))}</a>`
        : "";

      return `${pad}<nav${styleAttr}>
${indent(level + 1)}<div style="display:flex;align-items:center;justify-content:space-between;gap:16px">
${indent(level + 2)}<a href="${escapeHtml(String(props.brand?.href ?? "#"))}">${escapeHtml(String(props.brand?.text ?? "Polyglot"))}</a>
${indent(level + 2)}<div style="display:flex;align-items:center;gap:16px">
${links}
${cta}
${indent(level + 2)}</div>
${indent(level + 1)}</div>
${children}
${pad}</nav>`;
    }
    case "feature":
      return `${pad}<div${styleAttr}>
${indent(level + 1)}<h3>${escapeHtml(String(props.title ?? "Feature title"))}</h3>
${indent(level + 1)}<p>${escapeHtml(String(props.text ?? "Feature description"))}</p>
${pad}</div>`;
    case "testimonial":
      return `${pad}<blockquote${styleAttr}>
${indent(level + 1)}<p>${escapeHtml(String(props.quote ?? "Customer quote"))}</p>
${indent(level + 1)}<footer>${escapeHtml(
        `${String(props.author ?? "Customer")}${props.role ? `, ${String(props.role)}` : ""}`
      )}</footer>
${pad}</blockquote>`;
    case "pricing-card": {
      const features = (Array.isArray(props.features) ? props.features : [])
        .map((feature) => `${indent(level + 2)}<li>${escapeHtml(String(feature))}</li>`)
        .join("\n");

      const cta = props.cta?.text
        ? `${indent(level + 1)}<button type="button">${escapeHtml(String(props.cta.text))}</button>`
        : "";

      return `${pad}<article${styleAttr}>
${indent(level + 1)}<h3>${escapeHtml(String(props.title ?? "Plan"))}</h3>
${indent(level + 1)}<p>${escapeHtml(
        `${String(props.price ?? "$0")}${props.period ? ` / ${String(props.period)}` : ""}`
      )}</p>
${indent(level + 1)}<ul>
${features}
${indent(level + 1)}</ul>
${cta}
${pad}</article>`;
    }
    case "product-card":
      return `${pad}<article${styleAttr}>
${indent(level + 1)}<img src="${escapeHtml(String(props.image ?? "https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg"))}" alt="${escapeHtml(String(props.title ?? "Product"))}" />
${indent(level + 1)}<h3>${escapeHtml(String(props.title ?? "Product"))}</h3>
${indent(level + 1)}<p>${escapeHtml(String(props.price ?? "$0"))}</p>
${props.cta?.text ? `${indent(level + 1)}<button type="button">${escapeHtml(String(props.cta.text))}</button>` : ""}
${pad}</article>`;
    case "cta":
      return `${pad}<section${styleAttr}>
${indent(level + 1)}<h2>${escapeHtml(String(props.text ?? "Ready to build?"))}</h2>
${props.cta?.text ? `${indent(level + 1)}<button type="button">${escapeHtml(String(props.cta.text))}</button>` : ""}
${children}
${pad}</section>`;
    default:
      return `${pad}<div${styleAttr}>
${children}
${pad}</div>`;
  }
}

export function generateReactPageCode(
  project: Project,
  designElements: DesignElements,
  variant: ExportVariant = "tailwind"
) {
  const componentName = sanitizeComponentName(project.name);
  const body = getProjectRootIds(project)
    .map((rootId) => renderProjectNodeToJsx(rootId, project, designElements, 3))
    .join("\n");

  const imports = ['import React from "react";'];
  if (variant === "bootstrap") {
    imports.push('import "bootstrap/dist/css/bootstrap.min.css";');
  }

  const wrapperOpen =
    variant === "bootstrap"
      ? '    <main className="bg-light min-vh-100 py-5">\n      <div className="container">\n        <div className="bg-white rounded-4 shadow-sm p-4">'
      : '    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">\n      <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.45)]">';
  const wrapperClose =
    variant === "bootstrap"
      ? "        </div>\n      </div>\n    </main>"
      : "      </div>\n    </main>";
  const motionStyleBlock = `    <style>{\`${POLYGLOT_MOTION_CSS}\`}</style>`;

  return `${imports.join("\n")}

export default function ${componentName}() {
  return (
    <>
${motionStyleBlock}
${wrapperOpen}
${body}
${wrapperClose}
    </>
  );
}
`;
}

export function generateHtmlPageCode(
  project: Project,
  designElements: DesignElements
) {
  const body = getProjectRootIds(project)
    .map((rootId) => renderProjectNodeToHtml(rootId, project, designElements, 2))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(project.name)}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: #0f172a;
      font-family: "Manrope", "Segoe UI", sans-serif;
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

    ${POLYGLOT_MOTION_CSS}
  </style>
</head>
<body>
  <main>
${body}
  </main>
</body>
</html>`;
}
