"use client";

import React, { useState } from "react";
import { Palette, Type, Square, Moon, Sun, Check, Copy } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import {
  QUICK_PALETTES,
  ColorPalette,
  DEFAULT_DESIGN_SYSTEM,
} from "@/config/DesignSystem";
import { toast } from "sonner";

type Tab = "colors" | "typography" | "shadows";

// ─── Color Swatch ─────────────────────────────────────────────────────────────
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
    <div className="group flex items-center gap-3">
      <label className="relative cursor-pointer">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="h-9 w-9 shrink-0 rounded-xl border border-white/10 shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: value }}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="font-mono text-[11px] text-slate-600">{value}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-slate-700"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

// ─── Quick Palette Chip ───────────────────────────────────────────────────────
function PaletteChip({
  palette,
  onSelect,
}: {
  palette: (typeof QUICK_PALETTES)[0];
  onSelect: () => void;
}) {
  const colors = [
    palette.colors.background,
    palette.colors.surface,
    palette.colors.primary,
    palette.colors.secondary,
    palette.colors.accent,
  ];
  return (
    <button
      onClick={onSelect}
      className="group rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:shadow-md active:scale-[0.97]"
    >
      <div className="flex gap-1 mb-2">
        {colors.map((c, i) => (
          <div
            key={i}
            className="h-4 flex-1 rounded-md"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <p className="text-[10px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
        {palette.name}
      </p>
    </button>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function DesignSystemPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("colors");
  const currentProject = useProjectStore((s) => s.currentProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  const designSystem = currentProject?.designSystem ?? DEFAULT_DESIGN_SYSTEM as any;
  const colors: ColorPalette = designSystem?.colors ?? DEFAULT_DESIGN_SYSTEM.colors;

  const updateColor = (key: keyof ColorPalette, value: string) => {
    if (!currentProject) return;
    updateProject(currentProject.id, {
      designSystem: {
        ...designSystem,
        colors: { ...colors, [key]: value },
      },
    });
  };

  const applyQuickPalette = (palette: (typeof QUICK_PALETTES)[0]) => {
    if (!currentProject) return;
    updateProject(currentProject.id, {
      designSystem: { ...designSystem, colors: palette.colors },
    });
    toast.success(`Applied "${palette.name}" palette`);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Type", icon: Type },
    { id: "shadows", label: "Effects", icon: Square },
  ];

  if (!currentProject) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Palette className="mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">Open a project to edit its design system</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,242,255,0.95))] p-5 shadow-[0_24px_60px_-40px_rgba(99,102,241,0.3)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Design Tokens</p>
            <p className="mt-1.5 text-sm font-bold text-slate-900">{currentProject.name}</p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Palette size={18} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-lg transition-all ${
              activeTab === id
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={10} />
            {label}
          </button>
        ))}
      </div>

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Color Palette</h3>
            {(["background", "surface", "primary", "secondary", "accent"] as const).map((key) => (
              <ColorSwatch
                key={key}
                label={key}
                value={colors[key] || "#000000"}
                onChange={(v) => updateColor(key, v)}
              />
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Palettes</h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PALETTES.map((palette) => (
                <PaletteChip
                  key={palette.name}
                  palette={palette}
                  onSelect={() => applyQuickPalette(palette)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === "typography" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Font Family</h3>
          <select
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500"
            value={(designSystem as any)?.typography?.fontFamily || DEFAULT_DESIGN_SYSTEM.typography.fontFamily}
            onChange={(e) =>
              updateProject(currentProject.id, {
                designSystem: { ...designSystem, typography: { ...DEFAULT_DESIGN_SYSTEM.typography, fontFamily: e.target.value } },
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
            ].map((font) => (
              <option key={font} value={font}>{font.replace(/'/g, "").split(",")[0]}</option>
            ))}
          </select>
          <div
            className="mt-4 rounded-xl bg-slate-50 p-4 text-center"
            style={{ fontFamily: (designSystem as any)?.typography?.fontFamily || DEFAULT_DESIGN_SYSTEM.typography.fontFamily }}
          >
            <p className="text-2xl font-bold text-slate-900">Aa Bb Cc</p>
            <p className="mt-1 text-sm text-slate-500">The quick brown fox</p>
          </div>
        </div>
      )}

      {/* Shadows Tab */}
      {activeTab === "shadows" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shadow Presets</h3>
          {DEFAULT_DESIGN_SYSTEM.shadows.map((shadow) => (
            <div key={shadow.id} className="flex items-center gap-3">
              <div
                className="h-8 w-8 shrink-0 rounded-xl bg-white border border-slate-200"
                style={{ boxShadow: shadow.value === "none" ? "none" : shadow.value.replace("var(--poly-color-accent)", colors.accent).replace("var(--poly-color-primary)", colors.primary) }}
              />
              <div>
                <p className="text-xs font-semibold text-slate-700">{shadow.name}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">{shadow.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
