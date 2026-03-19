"use client";

import React, { useState } from "react";
import ActivityBar, { ActivityPanelId } from "./ActivityBar";
import StatusBar from "./StatusBar";
import IDEHeader from "@/components/ide/IDEHeader";
import IDETabBar from "@/components/ide/IDETabBar";
import RightInspectorPanel from "@/components/ide/RightInspectorPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CommandPalette from "@/components/ide/CommandPalette";

/* ── Size constants (match the design-system spec) ──────────────── */
const ACTBAR_W = 44;
const SIDEBAR_W = 240;
const INSPECTOR_W = 256;

interface IDEShellProps {
  /** The project ID — passed through for context/future use */
  projectId: string;
  /** Content for each activity-bar panel id */
  leftPanels?: Record<string, React.ReactNode>;
  /** Content for the right inspector panel */
  rightPanel?: React.ReactNode;
  /** Content for the main editor/canvas area */
  children?: React.ReactNode;
  /** Optional bottom panel (terminal, etc.) */
  bottomPanel?: React.ReactNode;
}

export default function IDEShell({
  projectId: _projectId,
  leftPanels = {},
  rightPanel = <RightInspectorPanel />,
  children,
  bottomPanel,
}: IDEShellProps) {
  const [activePanel, setActivePanel] = useState<ActivityPanelId>("explorer");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const sidebarVisible = !!(activePanel && leftPanels[activePanel]);
  const inspectorVisible = !!rightPanel;

  /*
   * CSS Grid layout
   *
   *  ┌──────────────────────────────────────────────────────────┐
   *  │ titlebar (full width, col 1..5)                          │
   *  ├──────────────────────────────────────────────────────────┤
   *  │ tabbar   (col 2..5, row 2)                               │
   *  ├────────┬──────────────┬──────────────────┬───────────────┤
   *  │ actbar │ sidebar      │ main             │ inspector     │
   *  │ col1   │ col2         │ col3 (1fr)       │ col4          │
   *  ├────────┴──────────────┴──────────────────┴───────────────┤
   *  │ status (full width, col 1..5)                            │
   *  └──────────────────────────────────────────────────────────┘
   *
   * Sidebar / inspector columns collapse to 0px when not visible.
   */
  const gridCols = [
    `${ACTBAR_W}px`,
    sidebarVisible ? `${SIDEBAR_W}px` : "0px",
    "1fr",
    inspectorVisible ? `${INSPECTOR_W}px` : "0px",
  ].join(" ");

  return (
    <div
      className="ide-shell"
      style={{
        display: "grid",
        gridTemplateColumns: gridCols,
        gridTemplateRows: "36px 34px 1fr 24px",
        gridTemplateAreas: `
          "titlebar titlebar titlebar titlebar"
          "actbar   tabbar  tabbar  tabbar"
          "actbar   sidebar main    inspector"
          "status   status  status  status"
        `,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-base)",
        color: "var(--text-1)",
        transition: "grid-template-columns 120ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* ── TITLE BAR ─────────────────────────────────────── */}
      <div style={{ gridArea: "titlebar" }}>
        <IDEHeader />
      </div>

      {/* ── ACTIVITY BAR ──────────────────────────────────── */}
      <div
        style={{
          gridArea: "actbar",
          background: "var(--bg-void)",
          borderRight: "1px solid var(--border-dim)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
      </div>

      {/* ── TAB BAR ────────────────────────────────────────── */}
      <div
        style={{
          gridArea: "tabbar",
          overflow: "hidden",
        }}
      >
        <IDETabBar />
      </div>

      {/* ── SIDEBAR ───────────────────────────────────────── */}
      <div
        style={{
          gridArea: "sidebar",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-soft)",
          overflowY: "auto",
          overflowX: "hidden",
          opacity: sidebarVisible ? 1 : 0,
          pointerEvents: sidebarVisible ? "auto" : "none",
          transition: "opacity 120ms cubic-bezier(0.16,1,0.3,1)",
        }}
        className="custom-scrollbar"
      >
        {activePanel && leftPanels[activePanel] && (
          <ErrorBoundary componentName="Sidebar">
            {leftPanels[activePanel]}
          </ErrorBoundary>
        )}
      </div>

      {/* ── MAIN AREA ─────────────────────────────────────── */}
      <div
        style={{
          gridArea: "main",
          background: "var(--bg-base)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {bottomPanel ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: "1 1 0", overflow: "hidden", position: "relative" }}>
              <ErrorBoundary componentName="MainArea">{children}</ErrorBoundary>
            </div>
            <div
              style={{
                height: 1,
                background: "var(--border-soft)",
                flexShrink: 0,
                cursor: "row-resize",
              }}
            />
            <div
              style={{
                height: 240,
                flexShrink: 0,
                background: "#0a0a0c",
                overflow: "hidden",
              }}
            >
              <ErrorBoundary componentName="BottomPanel">{bottomPanel}</ErrorBoundary>
            </div>
          </div>
        ) : (
          <ErrorBoundary componentName="MainArea">{children}</ErrorBoundary>
        )}
      </div>

      {/* ── INSPECTOR ─────────────────────────────────────── */}
      <div
        style={{
          gridArea: "inspector",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-soft)",
          overflowY: "auto",
          overflowX: "hidden",
          opacity: inspectorVisible ? 1 : 0,
          pointerEvents: inspectorVisible ? "auto" : "none",
          transition: "opacity 120ms cubic-bezier(0.16,1,0.3,1)",
        }}
        className="custom-scrollbar"
      >
        {rightPanel && (
          <ErrorBoundary componentName="Inspector">{rightPanel}</ErrorBoundary>
        )}
      </div>

      {/* ── STATUS BAR ────────────────────────────────────── */}
      <div style={{ gridArea: "status" }}>
        <StatusBar />
      </div>

      {/* ── FLOATING OVERLAYS ─────────────────────────────── */}
      <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />
    </div>
  );
}
