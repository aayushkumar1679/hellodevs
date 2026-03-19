/* eslint-disable @next/next/no-img-element */
import { useProjectStore, PolyglotProject } from "@/state/useProjectStore";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { getProjectRootIds } from "@/utils/projectModel";

// ─────────────────────────────────────────────────────────────────────────────
// CanvasElement interface (lightweight, used by the new functional API)
// ─────────────────────────────────────────────────────────────────────────────

export interface CanvasElement {
  id: string;
  /** Component type: 'Hero' | 'Navbar' | 'Button' | 'Container' | native html tag … */
  type: string;
  props: Record<string, unknown>;
  /** camelCase CSS properties (e.g. backgroundColor) */
  styles: Record<string, string>;
  children: CanvasElement[];
  codeRepresentation?: {
    componentName: string;
    filePath: string;
    tailwindClasses: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// New functional API  (canvasToCode / elementsToJSX / … )
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives a React component name from a file path.
 * e.g. "src/app/page.tsx" → "Page"
 *      "src/components/HeroSection.tsx" → "HeroSection"
 */
export function componentNameFromFile(fileName: string): string {
  const base = fileName
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .replace(/\.tsx?$/, "");

  // PascalCase the name
  return base
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "") || "Component";
}

/**
 * Converts a camelCase CSS style object into a sorted Tailwind-like class string.
 * Falls back to inline style string when no Tailwind mapping exists.
 * (A best-effort light mapper — extend as needed.)
 */
export function styleToTailwind(styles: Record<string, string>): string {
  const classMap: Record<string, (v: string) => string | null> = {
    display: (v) =>
      v === "flex" ? "flex" : v === "grid" ? "grid" : v === "block" ? "block" : null,
    flexDirection: (v) =>
      v === "column" ? "flex-col" : v === "row" ? "flex-row" : null,
    alignItems: (v) =>
      v === "center" ? "items-center" : v === "flex-start" ? "items-start" : v === "flex-end" ? "items-end" : null,
    justifyContent: (v) =>
      v === "center"
        ? "justify-center"
        : v === "space-between"
        ? "justify-between"
        : v === "flex-end"
        ? "justify-end"
        : null,
    width: (v) => (v === "100%" ? "w-full" : v === "auto" ? "w-auto" : null),
    height: (v) => (v === "100%" ? "h-full" : v === "auto" ? "h-auto" : null),
    position: (v) =>
      v === "relative" ? "relative" : v === "absolute" ? "absolute" : v === "fixed" ? "fixed" : null,
    overflow: (v) => (v === "hidden" ? "overflow-hidden" : v === "auto" ? "overflow-auto" : null),
    textAlign: (v) => (v === "center" ? "text-center" : v === "left" ? "text-left" : v === "right" ? "text-right" : null),
  };

  const classes: string[] = [];
  const inlineStyles: Record<string, string> = {};

  for (const [prop, value] of Object.entries(styles)) {
    const mapper = classMap[prop];
    if (mapper) {
      const cls = mapper(value);
      if (cls) {
        classes.push(cls);
        continue;
      }
    }
    inlineStyles[prop] = value;
  }

  return classes.join(" ").trim();
}

/**
 * Converts an object of props to a JSX attribute string.
 * e.g. { title: "Hello", count: 3, enabled: true } → 'title="Hello" count={3} enabled'
 */
export function propsToJSXString(props: Record<string, unknown>): string {
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      if (typeof v === "boolean") return v ? k : "";
      if (typeof v === "string") return `${k}="${v}"`;
      return `${k}={${JSON.stringify(v)}}`;
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * Collects unique import component names from an element tree.
 * Library components (PascalCase type) are presumed to come from
 * '@/app/components/library'.
 */
export function collectImports(elements: CanvasElement[]): string[] {
  const names = new Set<string>();

  function walk(el: CanvasElement) {
    // A component is "library" if its type starts with an uppercase letter
    if (/^[A-Z]/.test(el.type)) {
      names.add(el.type);
    }
    el.children.forEach(walk);
  }

  elements.forEach(walk);
  return Array.from(names).sort();
}

/**
 * Renders a CanvasElement tree to indented JSX lines.
 */
export function elementsToJSX(elements: CanvasElement[], indentLevel = 2): string {
  const pad = (n: number) => "  ".repeat(n);

  function renderEl(el: CanvasElement, depth: number): string {
    const tag = el.type;
    const propsStr = propsToJSXString(el.props);
    const twClasses = styleToTailwind(el.styles);

    // Build attribute string
    const attrs: string[] = [];
    if (twClasses) attrs.push(`className="${twClasses}"`);
    if (propsStr) attrs.push(propsStr);

    // Inline style fallback for any styles not covered by Tailwind mapping
    const inlineStyle: Record<string, string> = {};
    const classMap = new Set([
      "display", "flexDirection", "alignItems", "justifyContent",
      "width", "height", "position", "overflow", "textAlign",
    ]);
    for (const [k, v] of Object.entries(el.styles)) {
      if (!classMap.has(k)) inlineStyle[k] = v;
    }
    if (Object.keys(inlineStyle).length > 0) {
      attrs.push(`style={${JSON.stringify(inlineStyle)}}`);
    }

    const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";

    if (el.children.length === 0) {
      return `${pad(depth)}<${tag}${attrStr} />`;
    }

    const childrenStr = el.children
      .map((c) => renderEl(c, depth + 1))
      .join("\n");

    return `${pad(depth)}<${tag}${attrStr}>\n${childrenStr}\n${pad(depth)}</${tag}>`;
  }

  return elements.map((el) => renderEl(el, indentLevel)).join("\n");
}

/**
 * Main public API entry point.
 * Converts a CanvasElement[] tree to a valid .tsx file string.
 *
 * @param elements - The canvas element tree
 * @param fileName - The target file name (used to derive the component name)
 * @returns A string containing valid TypeScript JSX source
 */
export function canvasToCode(elements: CanvasElement[], fileName: string): string {
  const componentName = componentNameFromFile(fileName);
  const libraryImports = collectImports(elements);

  const lines: string[] = ["'use client';"];

  if (libraryImports.length > 0) {
    lines.push(
      `import { ${libraryImports.join(", ")} } from '@/app/components/library';`
    );
  }

  lines.push("");
  lines.push(`export default function ${componentName}() {`);
  lines.push("  return (");

  if (elements.length === 0) {
    lines.push("    <div />");
  } else if (elements.length === 1) {
    lines.push(elementsToJSX(elements, 4));
  } else {
    lines.push('    <div className="relative w-full">');
    lines.push(elementsToJSX(elements, 6));
    lines.push("    </div>");
  }

  lines.push("  );");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy API — kept for backward compatibility with existing callers
// ─────────────────────────────────────────────────────────────────────────────

function toPascalCase(str: string) {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");
}

function generateComponentBody(
  componentId: string,
  project: PolyglotProject,
  level = 2
): string {
  const component = project.components[componentId];
  if (!component) return "";

  const css: Record<string, unknown> = component.cssOverrides?.base ?? {};

  const styleStr =
    Object.keys(css).length > 0
      ? ` style={${JSON.stringify(css as Record<string, string>)}}`
      : "";

  const childrenJsx = component.children
    .map((cid) => generateComponentBody(cid, project, level + 1))
    .join("\n");

  const indent = "  ".repeat(level);
  const childIndent = "  ".repeat(level + 1);

  switch (component.type) {
    case "section":
      return `${indent}<section${styleStr}>\n${childrenJsx}\n${indent}</section>`;
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid":
      return `${indent}<div${styleStr}>\n${childrenJsx}\n${indent}</div>`;
    case "card":
    case "product-card":
    case "pricing-card":
      return `${indent}<article${styleStr}>\n${childrenJsx}\n${indent}</article>`;
    case "form":
      return `${indent}<form${styleStr}>\n${childrenJsx}\n${indent}</form>`;
    case "footer":
      return `${indent}<footer${styleStr}>\n${childrenJsx}\n${indent}</footer>`;
    case "heading": {
      const lvl = Math.min(Math.max(Number(component.props?.level ?? 2), 1), 6);
      const text = String(component.props?.text ?? "Heading");
      return `${indent}<h${lvl}${styleStr}>${text}</h${lvl}>`;
    }
    case "text": {
      const text = String(component.props?.text ?? "");
      return `${indent}<p${styleStr}>${text}</p>`;
    }
    case "button": {
      const text = String(component.props?.text ?? "Button");
      return `${indent}<button type="button"${styleStr}>${text}</button>`;
    }
    case "badge": {
      const text = String(component.props?.text ?? "Badge");
      return `${indent}<span${styleStr}>${text}</span>`;
    }
    case "image": {
      const src = String(component.props?.src ?? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200");
      const alt = String(component.props?.alt ?? "Image");
      return `${indent}<img src="${src}" alt="${alt}"${styleStr} />`;
    }
    case "navbar": {
      const brand = (component.props?.brand ?? {}) as { text?: string; href?: string };
      const links = (Array.isArray(component.props?.links) ? component.props.links : []) as Array<{ label?: string; href?: string }>;
      const cta = (component.props?.cta ?? {}) as { text?: string; href?: string };
      const linksJsx = links.map((l) =>
        `${childIndent}  <a href="${l.href ?? "#"}" style={{textDecoration:"none",color:"inherit",fontSize:"0.875rem",opacity:0.8}}>${l.label ?? "Link"}</a>`
      ).join("\n");
      return `${indent}<nav${styleStr}>
${childIndent}<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
${childIndent}  <a href="${brand.href ?? "/"}" style={{fontWeight:800,fontSize:"1.25rem",textDecoration:"none",color:"inherit"}}>${brand.text ?? "Brand"}</a>
${childIndent}  <div style={{display:"flex",gap:"1.5rem",alignItems:"center"}}>
${linksJsx}
${cta.text ? `${childIndent}    <a href="${cta.href ?? "#"}" style={{padding:"8px 20px",background:"#0f172a",color:"#fff",borderRadius:"999px",textDecoration:"none",fontWeight:600,fontSize:"0.875rem"}}>${cta.text}</a>` : ""}
${childIndent}  </div>
${childIndent}</div>
${indent}</nav>`;
    }
    default:
      if (component.children.length > 0) {
        return `${indent}<div${styleStr}>\n${childrenJsx}\n${indent}</div>`;
      }
      return `${indent}<div${styleStr} />`;
  }
}

/**
 * Syncs the current project state from Canvas to VFS.
 * This should be called whenever the canvas changes.
 */
export async function syncCanvasToVFS(project: PolyglotProject) {
  if (!project) return;
  const rootIds = getProjectRootIds(project);
  const { writeFile } = useFileSystemStore.getState();

  const componentFiles: { path: string; content: string }[] = rootIds.map((rootId) => {
    const comp = project.components[rootId];
    const compName = toPascalCase(comp?.type ?? "Section");
    const body = generateComponentBody(rootId, project, 2);

    return {
      path: `src/components/${compName}_${rootId.slice(-6)}.tsx`,
      content: `/* eslint-disable @next/next/no-img-element */\nimport React from "react";\n\nexport default function ${compName}() {\n  return (\n${body}\n  );\n}\n`,
    };
  });

  const componentImports = componentFiles
    .map((f, i) => {
      const name = f.path.replace("src/components/", "").replace(".tsx", "");
      const comp = project.components[rootIds[i]];
      const compName = toPascalCase(comp?.type ?? "Section");
      return `import ${compName}_${rootIds[i].slice(-6)} from "@/components/${name}";`;
    })
    .join("\n");

  const componentUsages = componentFiles
    .map((f, i) => {
      const comp = project.components[rootIds[i]];
      const compName = toPascalCase(comp?.type ?? "Section");
      return `      <${compName}_${rootIds[i].slice(-6)} />`;
    })
    .join("\n");

  const pageContent = `/* eslint-disable @next/next/no-img-element */\nimport React from "react";\n${componentImports}\n\nexport default function Page() {\n  return (\n    <main style={{ minHeight: "100vh", background: "#ffffff" }}>\n${componentUsages}\n    </main>\n  );\n}\n`;

  // Write files to VFS
  for (const file of componentFiles) {
    await writeFile(file.path, file.content);
  }
  await writeFile("src/app/page.tsx", pageContent);
}

/**
 * Setup a subscriber to useProjectStore that automatically calls syncCanvasToVFS
 * when the currentProject's updatedAt changes.
 */
export function initCanvasToCodeSync() {
  let lastUpdatedAt = "";
  useProjectStore.subscribe((state) => {
    const current = state.currentProject;
    if (current && current.updatedAt !== lastUpdatedAt) {
      lastUpdatedAt = current.updatedAt || "";
      syncCanvasToVFS(current).catch(console.error);
    }
  });
}
