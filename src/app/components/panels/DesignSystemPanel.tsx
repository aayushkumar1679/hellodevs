"use client";

import React, { useState } from "react";
import { Palette, Type, Square, Check, Copy } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import {
  QUICK_PALETTES,
  ColorPalette,
  DEFAULT_DESIGN_SYSTEM,
} from "@/config/DesignSystem";
import { toast } from "sonner";

type Tab = "colors" | "typography" | "effects";

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group flex items-center gap-2.5">
      <label className="relative cursor-pointer">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="h-7 w-7 flex-shrink-0 rounded-lg border border-white/10 shadow-sm transition-transform group-hover:scale-110"
          style={{ backgroundColor: value }}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
          {label}
        </p>
        <p className="font-mono text-[9px] text-white/40">{value}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="flex h-5 w-5 items-center justify-center rounded-md text-white/15 opacity-0 transition group-hover:opacity-100 hover:text-white/40"
      >
        {copied ? (
          <Check className="h-2.5 w-2.5 text-emerald-400" />
        ) : (
          <Copy className="h-2.5 w-2.5" />
        )}
      </button>
    </div>
  );
}

export default function DesignSystemPanel() {
  const [tab, setTab] = useState<Tab>("colors");
  const currentProject = useProjectStore((s) => s.currentProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  const designSystem = currentProject?.designSystem
    ? {
        ...DEFAULT_DESIGN_SYSTEM,
        ...currentProject.designSystem,
        colors: {
          ...DEFAULT_DESIGN_SYSTEM.colors,
          ...(currentProject.designSystem.colors ?? {}),
        },
        typography: {
          ...DEFAULT_DESIGN_SYSTEM.typography,
          ...(currentProject.designSystem.typography ?? {}),
        },
      }
    : DEFAULT_DESIGN_SYSTEM;
  const colors: ColorPalette = designSystem.colors;

  const updateColor = (key: keyof ColorPalette, value: string) => {
    if (!currentProject) return;
    updateProject({
      designSystem: { ...designSystem, colors: { ...colors, [key]: value } },
    });
  };

  const applyPalette = (p: (typeof QUICK_PALETTES)[0]) => {
    if (!currentProject) return;
    updateProject({
      designSystem: { ...designSystem, colors: p.colors },
    });
    toast.success(`Applied "${p.name}"`);
  };

  const TABS = [
    { id: "colors" as Tab, icon: Palette, label: "Colors" },
    { id: "typography" as Tab, icon: Type, label: "Type" },
    { id: "effects" as Tab, icon: Square, label: "Effects" },
  ];

  if (!currentProject) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Palette className="mb-3 h-6 w-6 text-white/10" />
        <p className="text-[10px] text-white/25">
          Open a project to edit tokens
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-white">
      {/* Tab bar */}
      <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${tab === id ? "bg-violet-600/80 text-white" : "text-white/25 hover:text-white/50"}`}
          >
            <Icon className="h-2.5 w-2.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Colors */}
      {tab === "colors" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
              Color Palette
            </p>
            {(
              [
                "background",
                "surface",
                "primary",
                "secondary",
                "accent",
              ] as const
            ).map((key) => (
              <ColorSwatch
                key={key}
                label={key}
                value={colors[key] || "#000000"}
                onChange={(v) => updateColor(key, v)}
              />
            ))}
          </div>
          <div>
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
              Quick Palettes
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_PALETTES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPalette(p)}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition hover:border-violet-500/25 hover:bg-violet-500/5"
                >
                  <div className="mb-1.5 flex gap-0.5">
                    {[
                      p.colors.background,
                      p.colors.surface,
                      p.colors.primary,
                      p.colors.secondary,
                      p.colors.accent,
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="h-3 flex-1 rounded-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] font-bold text-white/40 group-hover:text-white/60 transition">
                    {p.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography */}
      {tab === "typography" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
              Font Family
            </p>
            <select
              className="w-full rounded-lg border border-white/[0.07] bg-[#1A1A1E] px-2.5 py-1.5 text-[11px] text-white/60 outline-none appearance-none transition focus:border-violet-500/40"
              value={designSystem.typography.fontFamily}
              onChange={(e) =>
                updateProject({
                  designSystem: {
                    ...designSystem,
                    typography: {
                      ...DEFAULT_DESIGN_SYSTEM.typography,
                      fontFamily: e.target.value,
                    },
                  },
                })
              }
            >
              {[
                "'Manrope', sans-serif",
                "'Inter', sans-serif",
                "'Plus Jakarta Sans', sans-serif",
                "'Outfit', sans-serif",
                "'DM Sans', sans-serif",
                "'Sora', sans-serif",
                "'Space Grotesk', sans-serif",
                "'Playfair Display', serif",
                "'Lora', serif",
              ].map((f) => (
                <option key={f} value={f}>
                  {f.replace(/'/g, "").split(",")[0]}
                </option>
              ))}
            </select>
            <div
              className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
              style={{
                fontFamily: designSystem.typography.fontFamily,
              }}
            >
              <p className="text-xl font-bold text-white/70">Aa Bb Cc</p>
              <p className="mt-0.5 text-[11px] text-white/30">
                The quick brown fox
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Effects */}
      {tab === "effects" && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2.5">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
            Shadow Presets
          </p>
          {DEFAULT_DESIGN_SYSTEM.shadows.map((shadow) => (
            <div key={shadow.id} className="flex items-center gap-2.5">
              <div
                className="h-7 w-7 flex-shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.03]"
                style={{
                  boxShadow:
                    shadow.value === "none"
                      ? "none"
                      : shadow.value
                          .replace("var(--poly-color-accent)", colors.accent)
                          .replace("var(--poly-color-primary)", colors.primary),
                }}
              />
              <div>
                <p className="text-[10px] font-semibold text-white/50">
                  {shadow.name}
                </p>
                <p className="font-mono text-[8px] text-white/20 truncate max-w-[180px]">
                  {shadow.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
