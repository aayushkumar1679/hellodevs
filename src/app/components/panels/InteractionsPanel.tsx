"use client";

import React, { useMemo } from "react";
import {
  ArrowUpRight,
  Box,
  Layers3,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";
import { useDesignStore } from "@/state/useDesignStore";
import { useEditorStore } from "@/state/useEditorStore";
import {
  POLYGLOT_INTERACTION_TRANSITION,
} from "@/utils/motionStyles";

type CssPreset = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  values: Record<string, string>;
};

const DEPTH_PRESETS: CssPreset[] = [
  {
    id: "flat",
    label: "Flat",
    description: "Reset depth and return to a clean plane.",
    icon: Box,
    values: {
      transform: "",
      transformStyle: "",
      boxShadow: "",
      filter: "",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
  {
    id: "lifted",
    label: "Lifted",
    description: "A subtle premium card elevation.",
    icon: ArrowUpRight,
    values: {
      transform: "translateY(-10px) scale(1.01)",
      boxShadow: "0 28px 70px -38px rgba(15, 23, 42, 0.35)",
      filter: "",
      transformStyle: "",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
  {
    id: "tilted",
    label: "Tilted 3D",
    description: "A strong angled presentation for hero sections.",
    icon: Layers3,
    values: {
      transform: "perspective(1200px) rotateX(12deg) rotateY(-14deg)",
      transformStyle: "preserve-3d",
      boxShadow: "0 38px 110px -60px rgba(14, 165, 233, 0.45)",
      filter: "",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "High-drama depth for product and showcase blocks.",
    icon: Sparkles,
    values: {
      transform: "perspective(1400px) rotateX(18deg) rotateY(-18deg) scale(0.98)",
      transformStyle: "preserve-3d",
      boxShadow: "0 42px 130px -60px rgba(15, 23, 42, 0.52)",
      filter: "saturate(1.06)",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
];

const MOTION_PRESETS: CssPreset[] = [
  {
    id: "still",
    label: "Still",
    description: "No ambient animation.",
    icon: Box,
    values: {
      animation: "",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
  {
    id: "float",
    label: "Float",
    description: "Soft ambient movement for cards and mockups.",
    icon: Sparkles,
    values: {
      animation: "polyglot-float 6s ease-in-out infinite",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
  {
    id: "pulse",
    label: "Pulse",
    description: "Light breathing effect for badges and calls to action.",
    icon: Zap,
    values: {
      animation: "polyglot-pulse-soft 3.5s ease-in-out infinite",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
  {
    id: "rise",
    label: "Rise In",
    description: "Launch-style reveal motion for sections and headlines.",
    icon: Rocket,
    values: {
      animation: "polyglot-rise-in 900ms cubic-bezier(0.22, 1, 0.36, 1) both",
      transition: POLYGLOT_INTERACTION_TRANSITION,
    },
  },
];

function PresetGrid({
  title,
  subtitle,
  presets,
  isActive,
  onSelect,
}: {
  title: string;
  subtitle: string;
  presets: CssPreset[];
  isActive: (preset: CssPreset) => boolean;
  onSelect: (preset: CssPreset) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>

      <div className="grid gap-2">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const active = isActive(preset);

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={`rounded-[20px] border px-4 py-3 text-left transition ${
                active
                  ? "border-sky-300 bg-sky-50 text-sky-950 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.7)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
                    active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{preset.label}</p>
                    {active ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {preset.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function InteractionsPanel() {
  const selectedElements = useDesignStore((state) => state.selectedElements);
  const elements = useDesignStore((state) => state.elements);
  const updateCSSProperty = useDesignStore((state) => state.updateCSSProperty);
  const { activeBreakpoint } = useEditorStore();

  const primaryId = selectedElements[0];
  const element = primaryId ? elements[primaryId] : null;

  const css = useMemo(() => {
    if (!element) {
      return {};
    }

    const cssProperties = element.cssProperties;
    if (activeBreakpoint === "mobile") {
      return {
        ...(cssProperties.base ?? {}),
        ...(cssProperties.tablet ?? {}),
        ...(cssProperties.mobile ?? {}),
      };
    }

    if (activeBreakpoint === "tablet") {
      return {
        ...(cssProperties.base ?? {}),
        ...(cssProperties.tablet ?? {}),
      };
    }

    return { ...(cssProperties.base ?? {}) };
  }, [activeBreakpoint, element]);

  const isPresetActive = (preset: CssPreset) =>
    Object.entries(preset.values).every(([key, expected]) => {
      const value = css[key];
      return String(value ?? "") === expected;
    });

  const applyPreset = (preset: CssPreset) => {
    if (!primaryId) {
      return;
    }

    Object.entries(preset.values).forEach(([property, value]) => {
      updateCSSProperty(primaryId, property, value);
    });
  };

  if (!primaryId || !element) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-900">
          Motion starts with a selection
        </p>
        <p className="mt-2 max-w-xs text-xs leading-6 text-slate-500">
          Pick a layer on the canvas to add export-safe 3D depth, ambient motion,
          and smoother transitions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.95))] p-5 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Motion Studio
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              Add 3D depth and ambient motion to this layer.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Presets are applied at the current breakpoint and remain compatible
              with preview, share, and export.
            </p>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700 ring-1 ring-sky-200">
            {activeBreakpoint}
          </span>
        </div>
      </div>

      <PresetGrid
        title="Depth"
        subtitle="Shape how the selected block sits in space."
        presets={DEPTH_PRESETS}
        isActive={isPresetActive}
        onSelect={applyPreset}
      />

      <PresetGrid
        title="Motion"
        subtitle="Layer in ambient animation without leaving the builder."
        presets={MOTION_PRESETS}
        isActive={isPresetActive}
        onSelect={applyPreset}
      />

      <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-xs leading-6 text-slate-500">
        Motion is currently style-driven. Hover, click, and scroll-triggered logic
        can be layered next, but these presets already let users craft richer,
        more cinematic landing pages today.
      </div>
    </div>
  );
}
