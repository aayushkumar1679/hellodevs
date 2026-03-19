"use client";

import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  Hash,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useFileSystemStore } from "@/state/useFileSystemStore";

interface FileTreeItemProps {
  name: string;
  path: string;
  isFolder: boolean;
  childrenItems?: React.ReactNode;
  level: number;
}

/* ── File-type icon + color mapping ──────────────
   .tsx  → --accent   (violet)
   .ts   → --accent-2 (teal)
   .css  → #c678dd    (purple)
   .json → --accent-4 (orange)
   other → --text-3   (muted)
─────────────────────────────────────────────────── */
function getFileIcon(name: string): React.ReactNode {
  if (name.endsWith(".tsx")) {
    return <FileCode className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} />;
  }
  if (name.endsWith(".ts")) {
    return <FileCode className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--accent-2)" }} />;
  }
  if (name.endsWith(".css") || name.endsWith(".scss")) {
    return <Hash className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#c678dd" }} />;
  }
  if (name.endsWith(".json")) {
    return <FileJson className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--accent-4)" }} />;
  }
  return <FileText className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--text-3)" }} />;
}

/* ─────────────────────────────────────────────────
   FileTreeItem
   Row height : 22px
   Active     : --accent-dim bg + left 2px --accent border
                border-radius: 0 4px 4px 0
   Hover      : --bg-overlay
   Font       : 11px var(--font-ui) --text-2, active --text-1
───────────────────────────────────────────────── */
export default function FileTreeItem({
  name,
  path,
  isFolder,
  childrenItems,
  level,
}: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(level === 0); // auto-expand root level
  const { activeFile, openFile } = useFileSystemStore();
  const isActive = !isFolder && activeFile === path;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen((v) => !v);
    } else {
      openFile(path);
    }
  };

  return (
    <div className="select-none">
      {/* ── Row ─────────────────────────────────── */}
      <div
        onClick={handleClick}
        className="flex items-center cursor-pointer transition-all duration-[120ms]"
        style={{
          height: 22,
          paddingLeft: level * 12 + (isFolder ? 6 : 8),
          paddingRight: 8,
          gap: 5,
          /* Active state */
          background: isActive ? "var(--accent-dim)" : undefined,
          borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
          borderRadius: isActive ? "0 4px 4px 0" : undefined,
          color: isActive ? "var(--text-1)" : "var(--text-2)",
          fontFamily: "var(--font-ui)",
          fontSize: 11,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLDivElement).style.background = "var(--bg-overlay)";
            (e.currentTarget as HTMLDivElement).style.color = "var(--text-1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
            (e.currentTarget as HTMLDivElement).style.color = "var(--text-2)";
          }
        }}
      >
        {isFolder ? (
          <>
            <div
              className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center"
              style={{ color: "var(--text-3)" }}
            >
              {isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </div>
            {isOpen ? (
              <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--accent-4)" }} />
            ) : (
              <Folder className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--accent-4)" }} />
            )}
          </>
        ) : (
          <>
            {/* Invisible spacer to align with folders' chevron */}
            <div className="h-3.5 w-3.5 flex-shrink-0" />
            {getFileIcon(name)}
          </>
        )}
        <span className="truncate">{name}</span>
      </div>

      {/* ── Children ────────────────────────────── */}
      {isFolder && isOpen && (
        <div>{childrenItems}</div>
      )}
    </div>
  );
}
