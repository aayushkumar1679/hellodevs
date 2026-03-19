"use client";

import React, { useEffect, useState } from "react";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import FileTreeItem from "./FileTreeItem";
import { FilePlus, FolderPlus } from "lucide-react";

const DEFAULT_FILES = [
  { path: "src/app/page.tsx",    content: "export default function Page() {\n  return <div>Builder UI</div>;\n}" },
  { path: "src/app/layout.tsx",  content: "export default function Layout({ children }: { children: React.ReactNode }) {\n  return <html><body>{children}</body></html>;\n}" },
  { path: "src/app/globals.css", content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n" },
  { path: "package.json",        content: "{\n  \"name\": \"polyglot-project\",\n  \"version\": \"1.0.0\"\n}" },
  { path: "tsconfig.json",       content: "{\n  \"compilerOptions\": {\n    \"target\": \"es5\"\n  }\n}" },
  { path: "tailwind.config.ts",  content: "import type { Config } from \"tailwindcss\";\nexport default { content: [\"./src/**/*.{ts,tsx}\"] } satisfies Config;" },
];

/* ─────────────────────────────────────────────────
   FileTree
   Bg      : --bg-surface
   Header  : 9px ALL-CAPS, letter-spacing 0.08em, --text-3
   Items   : rendered via FileTreeItem (22px rows)
───────────────────────────────────────────────── */
export default function FileTree() {
  const { files, init } = useFileSystemStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    init().then(async () => {
      if (!mounted) return;
      const state = useFileSystemStore.getState();
      if (Object.keys(state.files).length === 0) {
        for (const file of DEFAULT_FILES) {
          await state.createFile(file.path, file.content);
        }
      }
      setIsInitializing(false);
    });
    return () => { mounted = false; };
  }, [init]);

  /* Build a nested tree from flat file paths */
  const buildTree = (fileRecord: Record<string, unknown>) => {
    const root: {
      name: string; path: string; isFolder: boolean;
      children: Record<string, typeof root>;
    } = { name: "root", path: "", isFolder: true, children: {} };

    Object.keys(fileRecord).forEach((path) => {
      const parts = path.split("/");
      let current = root;
      parts.forEach((part, i) => {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: parts.slice(0, i + 1).join("/"),
            isFolder: i < parts.length - 1,
            children: {},
          };
        }
        current = current.children[part];
      });
    });
    return root;
  };

  const tree = buildTree(files);

  const renderTree = (
    node: { name: string; path: string; isFolder: boolean; children: Record<string, unknown> },
    level = 0
  ): React.ReactNode => {
    return Object.values(node.children)
      .sort((a: unknown, b: unknown) => {
        const aa = a as { isFolder: boolean; name: string };
        const bb = b as { isFolder: boolean; name: string };
        if (aa.isFolder === bb.isFolder) return aa.name.localeCompare(bb.name);
        return aa.isFolder ? -1 : 1;
      })
      .map((child: unknown) => {
        const c = child as { name: string; path: string; isFolder: boolean; children: Record<string, unknown> };
        return (
          <FileTreeItem
            key={c.path}
            name={c.name}
            path={c.path}
            isFolder={c.isFolder}
            level={level}
            childrenItems={c.isFolder ? renderTree(c, level + 1) : null}
          />
        );
      });
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: "var(--bg-surface)", color: "var(--text-1)" }}
    >
      {/* ── Section header ──────────────────────── */}
      <div
        className="flex items-center justify-between px-3"
        style={{
          height: 30,
          borderBottom: "1px solid var(--border-dim)",
          flexShrink: 0,
        }}
      >
        <span
          className="font-bold uppercase tracking-[0.08em]"
          style={{ fontSize: 9, color: "var(--text-3)" }}
        >
          Explorer
        </span>
        <div className="flex items-center gap-2">
          <button
            title="New File"
            className="transition-colors duration-[120ms]"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
          >
            <FilePlus className="h-3 w-3" />
          </button>
          <button
            title="New Folder"
            className="transition-colors duration-[120ms]"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
          >
            <FolderPlus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── Tree items ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {isInitializing ? (
          <div
            className="px-4 py-3 text-center animate-pulse"
            style={{ fontSize: 11, color: "var(--text-3)" }}
          >
            Initializing VFS…
          </div>
        ) : Object.keys(files).length > 0 ? (
          renderTree(tree)
        ) : (
          <div
            className="px-4 py-3 text-center"
            style={{ fontSize: 11, color: "var(--text-3)" }}
          >
            Empty directory
          </div>
        )}
      </div>
    </div>
  );
}
