"use client";

import React, { useEffect, useState } from "react";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import FileTreeItem from "./FileTreeItem";
import { FolderPlus, FilePlus } from "lucide-react";

const DEFAULT_FILES = [
  { path: "src/app/page.tsx", content: "export default function Page() {\n  return <div>Builder UI</div>;\n}" },
  { path: "src/app/layout.tsx", content: "export default function Layout({ children }: { children: React.ReactNode }) {\n  return <html><body>{children}</body></html>;\n}" },
  { path: "src/app/globals.css", content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n" },
  { path: "package.json", content: "{\n  \"name\": \"polyglot-project\",\n  \"version\": \"1.0.0\"\n}" },
  { path: "tsconfig.json", content: "{\n  \"compilerOptions\": {\n    \"target\": \"es5\",\n    \"lib\": [\"dom\", \"dom.iterable\", \"esnext\"]\n  }\n}" },
  { path: "tailwind.config.ts", content: "import type { Config } from \"tailwindcss\";\nexport default {\n  content: [\"./src/**/*.{ts,tsx}\"],\n  theme: { extend: {} }\n} satisfies Config;" }
];

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

  const buildTree = (fileRecord: Record<string, any>) => {
    const root = { name: "root", path: "", isFolder: true, children: {} as Record<string, any> };
    Object.keys(fileRecord).forEach(path => {
      const parts = path.split("/");
      let current = root;
      parts.forEach((part, i) => {
        if (!current.children[part]) {
          const isFile = i === parts.length - 1;
          current.children[part] = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            isFolder: !isFile,
            children: {}
          };
        }
        current = current.children[part];
      });
    });
    return root;
  };

  const tree = buildTree(files);

  const renderTree = (node: any, level = 0): React.ReactNode => {
    return Object.values(node.children)
      .sort((a: any, b: any) => {
        if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
        return a.isFolder ? -1 : 1;
      })
      .map((child: any) => (
        <FileTreeItem
          key={child.path}
          name={child.name}
          path={child.path}
          isFolder={child.isFolder}
          level={level}
          childrenItems={child.isFolder ? renderTree(child, level + 1) : null}
        />
      ));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-primary)]">
      <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
        <span>Explorer</span>
        <div className="flex gap-2">
          <button title="New File" className="hover:text-[var(--text-primary)] transition-colors"><FilePlus className="h-3 w-3" /></button>
          <button title="New Folder" className="hover:text-[var(--text-primary)] transition-colors"><FolderPlus className="h-3 w-3" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {isInitializing ? (
          <div className="px-4 py-3 text-xs text-[var(--text-muted)] text-center animate-pulse">Initializing VFS...</div>
        ) : Object.keys(files).length > 0 ? (
          renderTree(tree)
        ) : (
          <div className="px-4 py-3 text-xs text-[var(--text-muted)] text-center">Empty directory</div>
        )}
      </div>
    </div>
  );
}
