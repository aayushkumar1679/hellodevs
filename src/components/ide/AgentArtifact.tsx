"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Loader2, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { DesignArtifact } from "@/lib/agents/designAgent";
import type { CodeArtifact } from "@/lib/agents/codeAgent";
import type { ArchitectPlan, ArchitectStep } from "@/lib/agents/architectAgent";
import type { ScreenshotArtifact } from "@/lib/agents/screenshotAgent";

type AnyArtifact = DesignArtifact | CodeArtifact | ArchitectPlan | ScreenshotArtifact;

interface Props {
  artifact: AnyArtifact;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Artifact — interactive checklist
// ─────────────────────────────────────────────────────────────────────────────
function PlanArtifact({ artifact }: { artifact: ArchitectPlan }) {
  const [steps, setSteps] = useState<ArchitectStep[]>(artifact.steps);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const total = steps.length;
  const done = steps.filter((s) => s.status === "done").length;

  function cycleStatus(id: string) {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next: Record<string, ArchitectStep["status"]> = {
          pending: "active",
          active: "done",
          done: "pending",
          error: "pending",
        };
        return { ...s, status: next[s.status] };
      })
    );
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }

  const statusIcon = (status: ArchitectStep["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle2 size={14} style={{ color: "var(--accent-5)", flexShrink: 0 }} />;
      case "active":
        return <Loader2 size={14} style={{ color: "var(--accent-2)", flexShrink: 0, animation: "spin 1s linear infinite" }} />;
      case "error":
        return <XCircle size={14} style={{ color: "var(--accent-3)", flexShrink: 0 }} />;
      default:
        return <Circle size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-1)", marginBottom: "4px" }}>
        {artifact.title}
      </p>
      {artifact.summary && (
        <p style={{ fontSize: "11px", color: "var(--text-2)", marginBottom: "8px", lineHeight: 1.5 }}>
          {artifact.summary}
        </p>
      )}

      {/* Progress bar */}
      <div style={{ height: "3px", background: "var(--bg-overlay)", borderRadius: "2px", marginBottom: "8px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.round((done / Math.max(total, 1)) * 100)}%`,
            background: "var(--accent-5)",
            borderRadius: "2px",
            transition: "width 300ms",
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {steps.map((step) => {
          const isExpanded = expanded.has(step.id);
          return (
            <div
              key={step.id}
              style={{
                background: "var(--bg-overlay)",
                borderRadius: "4px",
                overflow: "hidden",
                border: step.status === "active" ? "1px solid var(--accent-2)" : "1px solid transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 8px",
                  cursor: "pointer",
                }}
                onClick={() => toggleExpand(step.id)}
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); cycleStatus(step.id); }}
                >
                  {statusIcon(step.status)}
                </span>
                <span style={{ flex: 1, fontSize: "11px", color: step.status === "done" ? "var(--text-3)" : "var(--text-1)", textDecoration: step.status === "done" ? "line-through" : "none" }}>
                  {step.title}
                </span>
                {isExpanded
                  ? <ChevronDown size={11} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                  : <ChevronRight size={11} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                }
              </div>

              {isExpanded && (
                <div style={{ padding: "0 8px 8px 26px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-2)", lineHeight: 1.5, marginBottom: step.files.length ? "6px" : 0 }}>
                    {step.description}
                  </p>
                  {step.files.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {step.files.map((f) => (
                        <span key={f} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", background: "var(--accent-dim)", borderRadius: "3px", padding: "1px 5px" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Code Artifact — simple diff viewer with Accept/Reject
// ─────────────────────────────────────────────────────────────────────────────
function CodeArtifactView({ artifact, onAccept, onReject }: { artifact: CodeArtifact; onAccept?: () => void; onReject?: () => void }) {
  const [view, setView] = useState<"diff" | "after">("diff");
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);

  const lines = artifact.diff.split("\n");

  function accept() {
    setAccepted(true);
    onAccept?.();
  }

  function reject() {
    setRejected(true);
    onReject?.();
  }

  return (
    <div>
      {/* File path */}
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", marginBottom: "6px", background: "var(--accent-dim)", padding: "2px 6px", borderRadius: "3px", display: "inline-block" }}>
        {artifact.filePath}
      </p>

      {/* Explanation */}
      {artifact.explanation && (
        <p style={{ fontSize: "11px", color: "var(--text-2)", marginBottom: "6px", lineHeight: 1.5 }}>
          {artifact.explanation}
        </p>
      )}

      {/* View toggle */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {(["diff", "after"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "2px 8px",
              fontSize: "10px",
              borderRadius: "3px",
              border: "1px solid",
              borderColor: view === v ? "var(--border-mid)" : "var(--border-dim)",
              background: view === v ? "var(--bg-overlay)" : "transparent",
              color: view === v ? "var(--text-1)" : "var(--text-3)",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Diff view */}
      <div
        style={{
          background: "var(--bg-void)",
          border: "1px solid var(--border-dim)",
          borderRadius: "4px",
          maxHeight: "200px",
          overflowY: "auto",
          padding: "6px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          lineHeight: 1.6,
        }}
      >
        {view === "diff"
          ? lines.map((line, i) => {
              const added = line.startsWith("+");
              const removed = line.startsWith("-");
              return (
                <div
                  key={i}
                  style={{
                    color: added ? "var(--accent-5)" : removed ? "var(--accent-3)" : "var(--text-3)",
                    background: added ? "rgba(105,219,124,0.06)" : removed ? "rgba(255,107,107,0.06)" : "transparent",
                    paddingLeft: "4px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {line}
                </div>
              );
            })
          : artifact.after.split("\n").map((line, i) => (
              <div key={i} style={{ color: "var(--text-1)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {line}
              </div>
            ))}
      </div>

      {/* Accept / Reject */}
      {!accepted && !rejected && (
        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
          <button
            onClick={accept}
            style={{
              flex: 1,
              padding: "5px",
              background: "var(--accent-5)",
              border: "none",
              borderRadius: "4px",
              color: "#0a0a10",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Accept
          </button>
          <button
            onClick={reject}
            style={{
              flex: 1,
              padding: "5px",
              background: "transparent",
              border: "1px solid var(--accent-3)",
              borderRadius: "4px",
              color: "var(--accent-3)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Reject
          </button>
        </div>
      )}
      {accepted && <p style={{ color: "var(--accent-5)", fontSize: "11px", marginTop: "6px" }}>✓ Changes accepted</p>}
      {rejected && <p style={{ color: "var(--accent-3)", fontSize: "11px", marginTop: "6px" }}>✗ Changes rejected</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Design Artifact — before/after split preview
// ─────────────────────────────────────────────────────────────────────────────
function DesignArtifactView({ artifact }: { artifact: DesignArtifact | ScreenshotArtifact }) {
  return (
    <div>
      {artifact.explanation && (
        <p style={{ fontSize: "11px", color: "var(--text-2)", marginBottom: "6px", lineHeight: 1.5 }}>
          {artifact.explanation}
        </p>
      )}

      {artifact.changes && artifact.changes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "8px" }}>
          {artifact.changes.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px", fontSize: "11px", color: "var(--text-2)" }}>
              <span style={{ color: "var(--accent)", marginTop: "1px", flexShrink: 0 }}>•</span>
              {c}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {/* Before */}
        <div>
          <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)", marginBottom: "4px" }}>Before</p>
          <div
            style={{
              background: "var(--bg-void)",
              border: "1px solid var(--border-dim)",
              borderRadius: "4px",
              padding: "8px",
              minHeight: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-3)",
              fontSize: "10px",
            }}
          >
            {artifact.before.length === 0
              ? <span>Empty</span>
              : artifact.before.map((el) => (
                  <span
                    key={el.id}
                    style={{
                      padding: "2px 6px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "3px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-2)",
                    }}
                  >
                    {el.type}
                  </span>
                ))}
          </div>
        </div>

        {/* After */}
        <div>
          <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-2)", marginBottom: "4px" }}>After</p>
          <div
            style={{
              background: "var(--bg-void)",
              border: "1px solid var(--accent-2)",
              borderRadius: "4px",
              padding: "8px",
              minHeight: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            {artifact.after.length === 0
              ? <span style={{ color: "var(--text-3)", fontSize: "10px" }}>Empty</span>
              : artifact.after.map((el) => (
                  <span
                    key={el.id}
                    style={{
                      padding: "2px 6px",
                      background: "var(--accent-2-dim)",
                      border: "1px solid var(--accent-2)",
                      borderRadius: "3px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--accent-2)",
                    }}
                  >
                    {el.type}
                  </span>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dispatcher
// ─────────────────────────────────────────────────────────────────────────────
export default function AgentArtifact({ artifact }: Props) {
  if (artifact.type === "plan") {
    return <PlanArtifact artifact={artifact as ArchitectPlan} />;
  }
  if (artifact.type === "code") {
    return <CodeArtifactView artifact={artifact as CodeArtifact} />;
  }
  if (artifact.type === "design") {
    return <DesignArtifactView artifact={artifact as DesignArtifact | ScreenshotArtifact} />;
  }
  return null;
}
