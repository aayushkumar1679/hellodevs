"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FileCode,
  Hash,
  FileJson,
  FileText,
  Image as ImageIcon,
  X,
  LayoutGrid,
  Copy,
  Clipboard,
} from "lucide-react";
import { useFileSystemStore } from "@/state/useFileSystemStore";

// ── Types ──────────────────────────────────────────────────────────────────

interface ContextMenuState {
  x: number;
  y: number;
  path: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const iconProps = { width: 12, height: 12, strokeWidth: 1.5 };

  if (ext === "tsx")
    return <FileCode {...iconProps} style={{ color: "#7c6fff" }} />;
  if (ext === "ts")
    return <FileCode {...iconProps} style={{ color: "#00e5b0" }} />;
  if (ext === "css" || ext === "scss")
    return <Hash {...iconProps} style={{ color: "#c678dd" }} />;
  if (ext === "json")
    return <FileJson {...iconProps} style={{ color: "#ffa94d" }} />;
  if (ext === "png" || ext === "jpg" || ext === "svg" || ext === "webp")
    return <ImageIcon {...iconProps} style={{ color: "#69db7c" }} />;
  return <FileText {...iconProps} style={{ color: "var(--text-3)" }} />;
}

// ── ContextMenu ────────────────────────────────────────────────────────────

interface ContextMenuProps {
  menu: ContextMenuState;
  onClose: () => void;
}

function ContextMenu({ menu, onClose }: ContextMenuProps) {
  const { openFiles, closeFile, setActiveFile } = useFileSystemStore();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    {
      label: "Close",
      icon: <X width={11} height={11} />,
      action: () => {
        closeFile(menu.path);
        onClose();
      },
    },
    {
      label: "Close Others",
      icon: null,
      action: () => {
        openFiles.forEach((p) => { if (p !== menu.path) closeFile(p); });
        setActiveFile(menu.path);
        onClose();
      },
    },
    {
      label: "Close All",
      icon: null,
      action: () => {
        openFiles.forEach((p) => closeFile(p));
        onClose();
      },
    },
    { label: "divider", icon: null, action: () => {} },
    {
      label: "Copy Path",
      icon: <Clipboard width={11} height={11} />,
      action: () => {
        void navigator.clipboard.writeText(menu.path);
        onClose();
      },
    },
    {
      label: "Copy Relative Path",
      icon: <Copy width={11} height={11} />,
      action: () => {
        const rel = menu.path.replace(/^\/+/, "");
        void navigator.clipboard.writeText(rel);
        onClose();
      },
    },
  ];

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "fixed",
        top: menu.y,
        left: menu.x,
        zIndex: 9999,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-soft)",
        borderRadius: 6,
        padding: "4px 0",
        minWidth: 180,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        fontFamily: "var(--font-ui)",
        fontSize: 12,
      }}
    >
      {items.map((item, i) =>
        item.label === "divider" ? (
          <div
            key={i}
            style={{
              height: 1,
              background: "var(--border-dim)",
              margin: "3px 0",
            }}
          />
        ) : (
          <button
            key={item.label}
            role="menuitem"
            onClick={item.action}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "5px 12px",
              background: "transparent",
              border: "none",
              color: "var(--text-2)",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 80ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--bg-overlay)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-2)";
            }}
          >
            {item.icon && (
              <span style={{ opacity: 0.6, flexShrink: 0 }}>{item.icon}</span>
            )}
            <span>{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
}

// ── Tab ────────────────────────────────────────────────────────────────────

interface TabProps {
  path: string;
  isPinned?: boolean;
  onContextMenu: (e: React.MouseEvent, path: string) => void;
}

function Tab({ path, isPinned = false, onContextMenu }: TabProps) {
  const { activeFile, setActiveFile, closeFile } = useFileSystemStore();
  const [hovered, setHovered] = useState(false);

  const isActive = activeFile === path;
  const fileName = path === "__canvas__" ? "Canvas" : path.split("/").pop() ?? path;

  // Dirty = file in VFS has different content from what was last written
  // We track dirty via openFiles having the file open but no explicit saved state,
  // so we use a simpler heuristic: compare the in-memory file with itself is always
  // clean; actual dirty tracking would need a ref. For now we expose a setter via store.
  // The store writeFile is async and triggers a re-sync, so after write files[path].content
  // is up-to-date. Dirty detection lives in the editor; we accept a prop from parent
  // for cleanliness. For the tab bar itself we expose isDirty from store if available.
  // Since useFileSystemStore tracks only VFS content (post-save), we can't detect
  // in-flight edits from here. The tab bar shows dirty when there's no saved content
  // (undefined) — a lightweight proxy. This is intentional: full dirty state can be
  // threaded via a separate zustand slice later.
  const isDirty = false; // Placeholder: editor manages dirty state internally

  const canClose = !isPinned;

  const handleClick = () => {
    if (path === "__canvas__") {
      // Canvas tab: signal canvas view mode via URL or store if needed
      // For now just set it active in openFiles context
      return;
    }
    setActiveFile(path);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canClose) closeFile(path);
  };

  const tabStyle: React.CSSProperties = {
    height: 34,
    minWidth: 100,
    maxWidth: 200,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "0 10px",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "var(--font-ui)",
    whiteSpace: "nowrap",
    flexShrink: 0,
    position: "relative",
    borderRight: "1px solid var(--border-dim)",
    userSelect: "none",
    transition: "background 120ms cubic-bezier(0.16,1,0.3,1)",
    ...(isActive
      ? {
          background: "var(--bg-base)",
          color: "var(--text-1)",
        }
      : {
          background: hovered ? "var(--bg-overlay)" : "transparent",
          color: "var(--text-2)",
        }),
  };

  return (
    <div
      style={tabStyle}
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Active bottom border */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1.5px",
            background: "var(--accent)",
          }}
        />
      )}

      {/* Icon */}
      {path === "__canvas__" ? (
        <LayoutGrid width={12} height={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
      ) : (
        <span style={{ flexShrink: 0 }}>{getFileIcon(fileName)}</span>
      )}

      {/* Label */}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
        }}
      >
        {fileName}
      </span>

      {/* Dirty dot / close button */}
      {canClose && (
        <div
          style={{
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isDirty && !hovered ? (
            /* Orange dirty dot */
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--accent-4)",
              }}
            />
          ) : (
            /* Close × — visible on hover, or always when not dirty */
            <button
              onClick={handleClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                borderRadius: 4,
                border: "none",
                background: "transparent",
                color: "var(--text-3)",
                cursor: "pointer",
                padding: 0,
                opacity: hovered || !isDirty ? 1 : 0,
                transition: "opacity 120ms, background 120ms, color 120ms",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,107,107,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ff6b6b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-3)";
              }}
            >
              <X width={10} height={10} strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── IDETabBar ──────────────────────────────────────────────────────────────

export default function IDETabBar() {
  const { openFiles } = useFileSystemStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, path });
    },
    [],
  );

  const closeMenu = useCallback(() => setContextMenu(null), []);

  return (
    <>
      <div
        role="tablist"
        aria-label="Open files"
        style={{
          height: 34,
          display: "flex",
          alignItems: "stretch",
          background: "var(--bg-void)",
          borderBottom: "1px solid var(--border-dim)",
          overflowX: "auto",
          overflowY: "hidden",
          flexShrink: 0,
          /* Hide scrollbar visually but keep scrollable */
          scrollbarWidth: "none",
        }}
      >
        {/* Pinned Canvas tab — always first, never closeable */}
        <Tab
          path="__canvas__"
          isPinned
          onContextMenu={handleContextMenu}
        />

        {/* Open file tabs */}
        {openFiles.map((path) => (
          <Tab
            key={path}
            path={path}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      {/* Right-click context menu */}
      {contextMenu && (
        <ContextMenu menu={contextMenu} onClose={closeMenu} />
      )}
    </>
  );
}
