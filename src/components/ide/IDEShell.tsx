"use client";

import React, { useState } from "react";
import BuilderHeader from "@/app/components/layout/BuilderHeader";
import ActivityBar, { ActivityPanelId } from "./ActivityBar";
import StatusBar from "./StatusBar";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AIChatWidget from "@/app/components/AIChatWidget";
import CommandPalette from "@/components/ide/CommandPalette";

export default function IDEShell({
  children,
  leftPanels,
  rightPanel,
  bottomPanel,
}: {
  children: React.ReactNode;
  leftPanels: Record<string, React.ReactNode>;
  rightPanel: React.ReactNode;
  bottomPanel?: React.ReactNode;
}) {
  const [activePanel, setActivePanel] = useState<ActivityPanelId>("components");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div
      className="flex h-screen w-screen max-w-none flex-col text-[var(--text-primary)] overflow-hidden"
      style={{ background: "var(--bg-base)", width: "100vw", maxWidth: "none" }}
    >
      <BuilderHeader />
      
      <div className="flex flex-1 overflow-hidden relative" style={{ width: "100%" }}>
        <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
        
        <PanelGroup orientation="horizontal" className="flex-1 w-full relative" id="polyglot-ide-shell">
          {/* Side Panel Area */}
          {activePanel && leftPanels[activePanel] && (
            <Panel
              id="side-panel"
              defaultSize={20}
              minSize={15}
              maxSize={40}
              className="z-[30] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] overflow-hidden relative"
              style={{ minWidth: "260px" }}
            >
              <div className="h-full overflow-y-auto custom-scrollbar">
                <ErrorBoundary componentName="SidePanel">
                  {leftPanels[activePanel]}
                </ErrorBoundary>
              </div>
            </Panel>
          )}

          {activePanel && leftPanels[activePanel] && (
            <PanelResizeHandle className="w-1.5 bg-transparent hover:bg-[var(--accent-primary)]/30 transition-colors cursor-col-resize z-50 flex items-center justify-center group">
              <div className="w-[1px] h-8 bg-[var(--border-strong)] group-hover:bg-[var(--accent-primary)] transition-colors" />
            </PanelResizeHandle>
          )}

          {/* Main Panel Area (Canvas + Editor Split) */}
          <Panel
            id="main-panel"
            defaultSize={activePanel ? 55 : 75}
            minSize={30}
            className="relative z-[10] flex flex-col bg-[var(--bg-base)] overflow-hidden"
          >
            {bottomPanel ? (
              <PanelGroup orientation="vertical" className="h-full w-full">
                <Panel defaultSize={75} minSize={20} className="relative overflow-hidden flex flex-col">
                  {children}
                </Panel>
                <PanelResizeHandle className="h-1.5 bg-transparent hover:bg-[var(--accent-primary)]/30 transition-colors cursor-row-resize z-50 flex items-center justify-center group">
                  <div className="h-[1px] w-8 bg-[var(--border-strong)] group-hover:bg-[var(--accent-primary)] transition-colors" />
                </PanelResizeHandle>
                <Panel defaultSize={25} minSize={10} className="relative overflow-hidden flex flex-col bg-[#0a0a0c]">
                  {bottomPanel}
                </Panel>
              </PanelGroup>
            ) : (
              <main className="flex-1 overflow-hidden relative">
                {children}
              </main>
            )}
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-transparent hover:bg-[var(--accent-primary)]/30 transition-colors cursor-col-resize z-50 flex items-center justify-center group">
            <div className="w-[1px] h-8 bg-[var(--border-strong)] group-hover:bg-[var(--accent-primary)] transition-colors" />
          </PanelResizeHandle>

          {/* Inspector Panel Area */}
          <Panel
            id="inspector-panel"
            defaultSize={25}
            minSize={15}
            maxSize={45}
            className="z-[30] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl overflow-hidden relative"
            style={{ minWidth: "300px" }}
          >
            <ErrorBoundary componentName="InspectorPanel">
              {rightPanel}
            </ErrorBoundary>
          </Panel>
        </PanelGroup>

        <AIChatWidget />
        <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />
      </div>

      <StatusBar />
    </div>
  );
}
