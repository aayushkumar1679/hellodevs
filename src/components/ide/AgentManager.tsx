"use client";

import React, { useRef, useState } from "react";
import { useAgentStore } from "@/state/useAgentStore";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { useEditorStore } from "@/state/useEditorStore";
import { Bot, Code, LayoutDashboard, Camera, Send, Loader2, Paperclip, X } from "lucide-react";
import AgentArtifact from "./AgentArtifact";
import { runDesignAgent, DesignArtifact } from "@/lib/agents/designAgent";
import { runCodeAgent, CodeArtifact } from "@/lib/agents/codeAgent";
import { runArchitectAgent, ArchitectPlan } from "@/lib/agents/architectAgent";
import { runScreenshotAgent, fileToBase64, ScreenshotArtifact } from "@/lib/agents/screenshotAgent";

type AnyArtifact = DesignArtifact | CodeArtifact | ArchitectPlan | ScreenshotArtifact;

interface AgentSession {
  id: string;
  mode: string;
  task: string;
  artifact: AnyArtifact | null;
  error: string | null;
}

const MODES = [
  { id: "design",     icon: LayoutDashboard, label: "Design",     description: "Improve selected canvas elements" },
  { id: "code",       icon: Code,            label: "Code",        description: "Refactor the active file" },
  { id: "architect",  icon: Bot,             label: "Architect",   description: "Plan a new feature" },
  { id: "screenshot", icon: Camera,          label: "Vision",      description: "Screenshot → canvas" },
] as const;

export default function AgentManager() {
  const { mode, setMode, isProcessing, setProcessing } = useAgentStore();
  const { activeFile, files } = useFileSystemStore();
  const { selectedElements } = useEditorStore();

  const [task, setTask] = useState("");
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!task.trim() && mode !== "screenshot") return;
    if (mode === "screenshot" && !screenshotFile) return;

    const sessionId = `session-${Date.now()}`;
    const newSession: AgentSession = {
      id: sessionId,
      mode,
      task: task || "(screenshot)",
      artifact: null,
      error: null,
    };

    setSessions((prev) => [newSession, ...prev]);
    setProcessing(true);

    try {
      let artifact: AnyArtifact;

      switch (mode) {
        case "design": {
          const result = await runDesignAgent(task, selectedElements);
          artifact = result.artifact;
          break;
        }
        case "code": {
          const path = activeFile || "";
          const content = path && files[path] ? files[path].content : "";
          const result = await runCodeAgent(task, path, content);
          artifact = result.artifact;
          break;
        }
        case "architect": {
          const result = await runArchitectAgent(task);
          artifact = result.artifact;
          break;
        }
        case "screenshot": {
          const { base64, mimeType } = await fileToBase64(screenshotFile!);
          const result = await runScreenshotAgent(base64, mimeType, task);
          artifact = result.artifact;
          break;
        }
        default:
          throw new Error(`Unknown mode: ${mode}`);
      }

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, artifact } : s))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, error: message } : s))
      );
    } finally {
      setProcessing(false);
      setTask("");
      setScreenshotFile(null);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
        fontSize: "12px",
      }}
    >
      {/* Mode Pills */}
      <div style={{ padding: "10px 12px 0" }}>
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-3)",
            marginBottom: "6px",
          }}
        >
          Agent Mode
        </p>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                title={m.description}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border-soft)"}`,
                  background: active ? "var(--accent-dim)" : "transparent",
                  color: active ? "var(--text-accent)" : "var(--text-2)",
                  fontSize: "11px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 120ms",
                }}
              >
                <m.icon size={12} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Input */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-dim)" }}>
        {mode === "screenshot" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                border: "1px dashed var(--border-mid)",
                borderRadius: "4px",
                background: "var(--bg-input)",
                color: "var(--text-2)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              <Paperclip size={12} />
              {screenshotFile ? screenshotFile.name : "Attach screenshot…"}
              {screenshotFile && (
                <X
                  size={11}
                  onClick={(e) => { e.stopPropagation(); setScreenshotFile(null); }}
                  style={{ marginLeft: "auto", color: "var(--accent-3)" }}
                />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
            />
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="Optional: extra instructions…"
              style={{
                width: "100%",
                padding: "6px 8px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-soft)",
                borderRadius: "4px",
                color: "var(--text-1)",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", gap: "6px" }}>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={
                mode === "design"
                  ? "Describe the design change…"
                  : mode === "code"
                  ? "Describe the code change…"
                  : "Describe the feature to build…"
              }
              rows={2}
              style={{
                flex: 1,
                padding: "6px 8px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-soft)",
                borderRadius: "4px",
                color: "var(--text-1)",
                fontSize: "12px",
                resize: "none",
                outline: "none",
                fontFamily: "var(--font-ui)",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !task.trim()}
              style={{
                padding: "6px 10px",
                background: "var(--accent)",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                cursor: isProcessing || !task.trim() ? "not-allowed" : "pointer",
                opacity: isProcessing || !task.trim() ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        )}

        {mode === "screenshot" && (
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !screenshotFile}
            style={{
              marginTop: "6px",
              width: "100%",
              padding: "6px",
              background: "var(--accent)",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: isProcessing || !screenshotFile ? "not-allowed" : "pointer",
              opacity: isProcessing || !screenshotFile ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "12px",
            }}
          >
            {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            Reconstruct Layout
          </button>
        )}
      </div>

      {/* Session History */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {sessions.length === 0 && (
          <p style={{ color: "var(--text-3)", fontSize: "11px", textAlign: "center", marginTop: "24px" }}>
            No agent sessions yet.
          </p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-dim)",
              borderRadius: "6px",
              padding: "8px 10px",
            }}
          >
            {/* Session header */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--accent-2)",
                  padding: "1px 5px",
                  background: "var(--accent-2-dim)",
                  borderRadius: "3px",
                }}
              >
                {s.mode}
              </span>
              <span style={{ color: "var(--text-2)", fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.task}
              </span>
              {!s.artifact && !s.error && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--accent-2)",
                    animation: "pulse 1.4s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
              )}
              {s.error && (
                <span style={{ color: "var(--accent-3)", fontSize: "10px" }}>Error</span>
              )}
            </div>

            {s.error && (
              <p style={{ color: "var(--accent-3)", fontSize: "11px", marginTop: "4px" }}>
                {s.error}
              </p>
            )}

            {s.artifact && (
              <AgentArtifact artifact={s.artifact} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
