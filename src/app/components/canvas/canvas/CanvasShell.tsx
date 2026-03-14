/*
 * CANVAS OUTER WRAPPER — src/app/components/canvas/CanvasShell.tsx
 *
 * This thin shell wraps the existing Canvas component and provides:
 * - The dark dot-grid background
 * - Proper overflow + scroll container
 * - Device-frame chrome (mobile/tablet notch bar)
 * - Empty-state when no components exist
 * - z-index: 0 so sidebars always win
 *
 * The existing Canvas.tsx logic (drag, drop, selection, guides)
 * stays untouched — we just swap the outer container styling.
 */

"use client";

import React from "react";
import { useEditorStore } from "@/state/useEditorStore";
import { useProjectStore } from "@/state/useProjectStore";
import { getProjectRootIds } from "@/utils/projectModel";
import { Wand2 } from "lucide-react";

interface CanvasShellProps {
  children: React.ReactNode;
}

/** Width in pixels for each breakpoint's canvas frame */
const BREAKPOINT_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
} as const;

export default function CanvasShell({ children }: CanvasShellProps) {
  const { activeBreakpoint, previewEnabled } = useEditorStore();
  const currentProject = useProjectStore((s) => s.currentProject);

  const isEmpty =
    !currentProject || getProjectRootIds(currentProject).length === 0;

  const isMobile = activeBreakpoint === "mobile";
  const isTablet = activeBreakpoint === "tablet";
  const isNarrow = isMobile || isTablet;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: "#0C0C0F" }}
    >
      {/* ── Dot-grid background ─────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Edge vignette so dots fade at borders */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#0C0C0F_100%)]" />

      {/* ── Preview-mode banner ──────────────────────────── */}
      {previewEnabled && (
        <div className="relative z-10 flex h-6 flex-shrink-0 items-center justify-center border-b border-sky-500/20 bg-sky-500/8 text-[9px] font-bold uppercase tracking-[0.25em] text-sky-400">
          Live preview · {activeBreakpoint}
        </div>
      )}

      {/* ── Scroll container ─────────────────────────────── */}
      <div
        className="relative z-10 flex flex-1 justify-center overflow-auto px-6 py-8"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        {isEmpty ? (
          /* ── Empty state ──────────────────────────────── */
          <div className="flex w-full max-w-lg flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <Wand2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-white/60">
              Canvas is empty
            </p>
            <p className="mt-1.5 max-w-xs text-[12px] leading-5 text-white/25">
              Use the AI Studio panel on the left to generate a full page from a
              prompt, or drag components from the library.
            </p>
          </div>
        ) : (
          /* ── Device frame ───────────────────────────────── */
          <div
            className={`relative flex-shrink-0 overflow-hidden bg-white transition-[width] duration-300 ${
              isNarrow
                ? "rounded-[36px] shadow-[0_0_0_10px_#1a1a1e,0_40px_80px_-20px_rgba(0,0,0,0.8)]"
                : "rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
            }`}
            style={{
              width: BREAKPOINT_WIDTHS[activeBreakpoint],
              minHeight: isNarrow ? "80vh" : "100%",
            }}
          >
            {/* Device notch bar for mobile/tablet */}
            {isNarrow && (
              <div className="flex h-7 items-center justify-center bg-[#1a1a1e]">
                <div className="h-1 w-16 rounded-full bg-[#2a2a30]" />
              </div>
            )}

            {/* Design tokens injected as CSS vars */}
            <div
              style={
                currentProject?.designSystem
                  ? ({
                      "--poly-color-background":
                        currentProject.designSystem.colors.background,
                      "--poly-color-surface":
                        currentProject.designSystem.colors.surface,
                      "--poly-color-primary":
                        currentProject.designSystem.colors.primary,
                      "--poly-color-secondary":
                        currentProject.designSystem.colors.secondary,
                      "--poly-color-accent":
                        currentProject.designSystem.colors.accent,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
