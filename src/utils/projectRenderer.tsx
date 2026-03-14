import React from "react";
import type { PolyglotProject, PolyglotComponent } from "@/state/useProjectStore";
import type { Breakpoint } from "@/state/useEditorStore";
import PrimitiveRenderer from "@/components/project/PrimitiveRenderer";
import {
  getBreakpointCss,
  getProjectRootIds,
} from "@/utils/projectModel";
import { POLYGLOT_MOTION_CSS } from "@/utils/motionStyles";

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
  project: PolyglotProject,
  breakpoint: Breakpoint
) {
  return project.components[componentId].children.map((childId) =>
    renderProjectNodeToReact(childId, project, breakpoint)
  );
}

function renderChildrenToJsx(
  componentId: string,
  project: PolyglotProject,
  level: number
) {
  return project.components[componentId].children
    .map((childId) =>
      renderProjectNodeToJsx(childId, project, level + 1)
    )
    .join("\n");
}

function renderChildrenToHtml(
  componentId: string,
  project: PolyglotProject,
  level: number
) {
  return project.components[componentId].children
    .map((childId) =>
      renderProjectNodeToHtml(childId, project, level + 1)
    )
    .join("\n");
}

function indent(level: number) {
  return "  ".repeat(level);
}

function getNodeState(
  componentId: string,
  project: PolyglotProject,
  breakpoint: Breakpoint
) {
  const component = project.components[componentId];

  return {
    component,
    props: (component.props ?? {}) as ComponentProps,
    style: getBreakpointCss(component, breakpoint),
  };
}

export function renderProjectNodeToReact(
  componentId: string,
  project: PolyglotProject,
  breakpoint: Breakpoint = "desktop"
): React.ReactNode {
  const { component, props, style } = getNodeState(
    componentId,
    project,
    breakpoint
  );

  if (!component) {
    return null;
  }

  const children = renderChildrenToReact(
    componentId,
    project,
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
    case "footer":
      return (
        <footer key={componentId} style={style}>
          {children}
        </footer>
      );
    default:
      return (
        <PrimitiveRenderer
          key={componentId}
          type={component.type}
          props={props}
          style={style}
        >
          {children}
        </PrimitiveRenderer>
      );
  }
}

export function renderProjectTreeToReact(
  project: PolyglotProject,
  breakpoint: Breakpoint = "desktop"
) {
  return getProjectRootIds(project).map((rootId) =>
    renderProjectNodeToReact(rootId, project, breakpoint)
  );
}

function buildMotionProps(component: PolyglotComponent): string {
  if (!component.animations || component.animations.length === 0) return "";
  const parts: string[] = [];
  let hasHidden = false;
  let hasVisible = false;
  let hasScrollVisible = false;
  let hasHover = false;
  let hasTap = false;
  const hiddenObj: Record<string, unknown> = {};
  const visibleObj: Record<string, unknown> = {};
  const scrollVisibleObj: Record<string, unknown> = {};
  const hoverObj: Record<string, unknown> = {};
  const tapObj: Record<string, unknown> = {};

  const PRESETS: Record<string, any> = {
    "fade-in": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
    "fade-up": { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
    "slide-in-left": { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } },
    "slide-in-right": { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } },
    "scale-up": { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
    "blur-in": { hidden: { opacity: 0, filter: "blur(10px)" }, visible: { opacity: 1, filter: "blur(0px)" } },
    "rotate-in": { hidden: { opacity: 0, rotate: -15, scale: 0.9 }, visible: { opacity: 1, rotate: 0, scale: 1 } },
    "hover-float": { hover: { y: -8 } },
    "hover-scale": { hover: { scale: 1.05 } },
    "hover-glow": { hover: { boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)", y: -2 } },
    "tap-shrink": { tap: { scale: 0.95 } },
  };

  component.animations.forEach((anim: any) => {
    const preset = PRESETS[anim.preset];
    if (!preset) return;
    const dur = anim.duration ?? 0.6;
    const delay = anim.delay ?? 0;
    const transition = JSON.stringify({ duration: dur, delay });

    if ((anim.trigger === "load" || anim.trigger === "scroll") && preset.hidden && preset.visible) {
      Object.assign(hiddenObj, preset.hidden);
      const vis = { ...preset.visible, transition: { duration: dur, delay } };
      if (anim.trigger === "scroll") {
        hasScrollVisible = true;
        Object.assign(scrollVisibleObj, vis);
        hasHidden = true;
      } else {
        hasVisible = true;
        hasHidden = true;
        Object.assign(visibleObj, vis);
      }
    } else if (anim.trigger === "hover" && preset.hover) {
      hasHover = true;
      Object.assign(hoverObj, preset.hover);
    } else if (anim.trigger === "tap" && preset.tap) {
      hasTap = true;
      Object.assign(tapObj, preset.tap);
    }
  });

  if (hasHidden) parts.push(`initial={${JSON.stringify(hiddenObj)}}`);
  if (hasVisible) parts.push(`animate={${JSON.stringify(visibleObj)}}`);
  if (hasScrollVisible) {
    parts.push(`whileInView={${JSON.stringify(scrollVisibleObj)}}`);
    const repeatAnims = component.animations.find((a: any) => a.trigger === "scroll" && a.repeat);
    parts.push(`viewport={{ once: ${repeatAnims ? "false" : "true"}, margin: "-50px" }}`);
  }
  if (hasHover) parts.push(`whileHover={${JSON.stringify(hoverObj)}}`);
  if (hasTap) parts.push(`whileTap={${JSON.stringify(tapObj)}}`);

  return parts.join(" ");
}

function hasAnimations(component: PolyglotComponent): boolean {
  return Array.isArray(component.animations) && component.animations.length > 0;
}

function renderProjectNodeToJsx(
  componentId: string,
  project: PolyglotProject,
  level = 3
): string {
  const { component, props, style } = getNodeState(
    componentId,
    project,
    "desktop"
  );

  if (!component) {
    return "";
  }

  const pad = indent(level);
  const styleAttr = styleToJsx(style);
  const motionAttr = hasAnimations(component) ? ` ${buildMotionProps(component)}` : "";
  const useMotion = hasAnimations(component);
  const children = renderChildrenToJsx(componentId, project, level);


  switch (component.type) {
    case "section": {
      if (useMotion) return `${pad}<motion.section${motionAttr}${styleAttr}>\n${children}\n${pad}</motion.section>`;
      return `${pad}<section${styleAttr}>\n${children}\n${pad}</section>`;
    }
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid": {
      if (useMotion) return `${pad}<motion.div${motionAttr}${styleAttr}>\n${children}\n${pad}</motion.div>`;
      return `${pad}<div${styleAttr}>\n${children}\n${pad}</div>`;
    }
    case "card": {
      if (useMotion) return `${pad}<motion.article${motionAttr}${styleAttr}>\n${children}\n${pad}</motion.article>`;
      return `${pad}<article${styleAttr}>\n${children}\n${pad}</article>`;
    }
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
  project: PolyglotProject,
  level = 2
): string {
  const { component, props, style } = getNodeState(
    componentId,
    project,
    "desktop"
  );

  if (!component) {
    return "";
  }

  const pad = indent(level);
  const styleAttr = styleToHtml(style);
  const children = renderChildrenToHtml(componentId, project, level);

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
  project: PolyglotProject,
  variant: ExportVariant = "tailwind"
) {
  const componentName = sanitizeComponentName(project.name);
  const body = getProjectRootIds(project)
    .map((rootId) => renderProjectNodeToJsx(rootId, project, 3))
    .join("\n");

  // check if framer-motion needed
  const allComponents = Object.values(project.components);
  const needsMotion = allComponents.some((c) => Array.isArray(c.animations) && c.animations.length > 0);

  const imports = ['import React from "react";'];
  if (needsMotion) imports.push('import { motion } from "framer-motion";');
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
  project: PolyglotProject
) {
  const body = getProjectRootIds(project)
    .map((rootId) => renderProjectNodeToHtml(rootId, project, 2))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(project.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --font-manrope: "Manrope", sans-serif;
      --font-inter: "Inter", sans-serif;
      --font-plus-jakarta-sans: "Plus Jakarta Sans", sans-serif;
      --font-outfit: "Outfit", sans-serif;
      --font-dm-sans: "DM Sans", sans-serif;
      --font-sora: "Sora", sans-serif;
      --font-space-grotesk: "Space Grotesk", sans-serif;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      background: #ffffff;
      color: #0f172a;
      font-family: var(--font-manrope), sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    main {
      min-height: 100vh;
    }

    img {
      max-width: 100%;
      display: block;
    }

    a { color: inherit; }

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
