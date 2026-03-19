"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { useFileSystemStore } from "@/state/useFileSystemStore";

// ── Types ──────────────────────────────────────────────────────────────────

type InspectorTab = "Props" | "Style" | "Events" | "Code";

interface PropRow {
  label: string;
  value: string;
  placeholder?: string;
}

// ── Placeholder data ───────────────────────────────────────────────────────

const MOCK_PROPS: PropRow[] = [
  { label: "id",          value: "",           placeholder: "element-id" },
  { label: "className",   value: "",           placeholder: "class names" },
  { label: "href",        value: "",           placeholder: "https://" },
  { label: "target",      value: "_self",      placeholder: "_self" },
  { label: "aria-label",  value: "",           placeholder: "accessible name" },
  { label: "data-testid", value: "",           placeholder: "test id" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontFamily: "var(--font-ui)",
        color: "var(--text-3)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "10px 12px 4px",
        borderBottom: "1px solid var(--border-dim)",
        marginBottom: 2,
      }}
    >
      {children}
    </div>
  );
}

function PropInput({ row, onChange }: { row: PropRow; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 28,
        borderBottom: "1px solid var(--border-dim)",
        gap: 0,
      }}
    >
      <div
        style={{
          width: 80,
          flexShrink: 0,
          padding: "0 10px",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--text-3)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {row.label}
      </div>
      <input
        value={row.value}
        placeholder={row.placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          height: 28,
          padding: "0 8px",
          background: "var(--bg-input)",
          border: "none",
          borderLeft: "1px solid var(--border-dim)",
          borderRight: "none",
          color: "var(--text-1)",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = "var(--bg-overlay)";
          e.currentTarget.style.borderLeft = "1px solid var(--accent)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = "var(--bg-input)";
          e.currentTarget.style.borderLeft = "1px solid var(--border-dim)";
        }}
      />
    </div>
  );
}

// ── Tab Contents ───────────────────────────────────────────────────────────

function PropsTab() {
  const [rows, setRows] = useState<PropRow[]>(MOCK_PROPS);

  const update = (i: number, v: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, value: v } : r)));

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <SectionLabel>HTML Attributes</SectionLabel>
      {rows.map((row, i) => (
        <PropInput key={row.label} row={row} onChange={(v) => update(i, v)} />
      ))}

      <SectionLabel>Layout</SectionLabel>
      {(
        [
          { label: "width",    value: "", placeholder: "auto" },
          { label: "height",   value: "", placeholder: "auto" },
          { label: "min-w",    value: "", placeholder: "0" },
          { label: "max-w",    value: "", placeholder: "none" },
        ] as PropRow[]
      ).map((row) => (
        <PropInput key={row.label} row={row} onChange={() => {}} />
      ))}
    </div>
  );
}

function StyleTab() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-3)",
        fontSize: 11,
        fontFamily: "var(--font-ui)",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Style Panel
      </div>
      <div style={{ color: "var(--text-2)", fontSize: 12 }}>Coming soon</div>
    </div>
  );
}

function EventsTab() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-3)",
        fontSize: 11,
        fontFamily: "var(--font-ui)",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Event Bindings
      </div>
      <div style={{ color: "var(--text-2)", fontSize: 12 }}>Coming soon</div>
    </div>
  );
}

function CodeTab() {
  const { activeFile, files } = useFileSystemStore();
  const content = activeFile ? (files[activeFile]?.content ?? "") : "";

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "6px 12px",
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          color: "var(--text-3)",
          borderBottom: "1px solid var(--border-dim)",
          background: "var(--bg-void)",
        }}
      >
        {activeFile ?? "No file selected"} — read-only
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          height="100%"
          language={activeFile ? (activeFile.endsWith(".tsx") || activeFile.endsWith(".ts") ? "typescript" : "javascript") : "plaintext"}
          theme="polyglot-dark"
          value={content}
          options={{
            readOnly: true,
            fontSize: 11,
            fontFamily: "'DM Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            padding: { top: 8, bottom: 8 },
            lineNumbers: "off",
            folding: false,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            scrollbar: {
              verticalScrollbarSize: 3,
              horizontalScrollbarSize: 3,
            },
          }}
        />
      </div>
    </div>
  );
}

// ── RightInspectorPanel ────────────────────────────────────────────────────

const TABS: InspectorTab[] = ["Props", "Style", "Events", "Code"];

export default function RightInspectorPanel() {
  const [activeTab, setActiveTab] = useState<InspectorTab>("Props");

  return (
    <div
      style={{
        width: 256,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--border-dim)",
        overflow: "hidden",
        fontFamily: "var(--font-ui)",
      }}
    >
      {/* Tab header strip */}
      <div
        role="tablist"
        style={{
          display: "flex",
          height: 34,
          borderBottom: "1px solid var(--border-dim)",
          background: "var(--bg-void)",
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                height: "100%",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 9,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-ui)",
                color: isActive ? "var(--text-1)" : "var(--text-3)",
                position: "relative",
                transition: "color 120ms",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--text-2)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--text-3)";
              }}
            >
              {tab}
              {/* Active bottom accent */}
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
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeTab === "Props"  && <PropsTab />}
        {activeTab === "Style"  && <StyleTab />}
        {activeTab === "Events" && <EventsTab />}
        {activeTab === "Code"   && <CodeTab />}
      </div>
    </div>
  );
}
