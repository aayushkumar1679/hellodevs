import { useProjectStore, PolyglotProject } from "@/state/useProjectStore";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { getProjectRootIds } from "@/utils/projectModel";

// Basic helpers borrowed from exporter
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
