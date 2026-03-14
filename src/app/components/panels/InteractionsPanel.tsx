"use client";

import React, { useMemo } from "react";
import { Sparkles, Trash2, Plus, FastForward, Clock, Zap } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import {
  ANIMATION_PRESETS,
  AnimationConfig,
  AnimationTrigger,
} from "@/config/animationPresets";

const SEL =
  "w-full rounded-lg border border-white/[0.07] bg-[#1A1A1E] px-2.5 py-1.5 text-[10px] text-white/60 outline-none transition focus:border-violet-500/40 focus:text-white/80 appearance-none cursor-pointer";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 rounded-full transition-colors ${checked ? "bg-violet-600" : "bg-white/10"}`}
      >
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${checked ? "translate-x-3" : "translate-x-0.5"}`}
        />
      </button>
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">
        {label}
      </span>
    </label>
  );
}

export default function InteractionsPanel() {
  const selectedElements = useEditorStore((s) => s.selectedElements);
  const elements = useProjectStore((s) => s.currentProject?.components);
  const updateComp = useProjectStore((s) => s.updateComponent);
  const primaryId = selectedElements[0];
  const element = primaryId ? elements?.[primaryId] : null;
  const animations: AnimationConfig[] = useMemo(
    () => element?.animations || [],
    [element],
  );

  const addAnimation = () => {
    if (!element) return;
    updateComp(element.id, {
      animations: [
        ...animations,
        {
          id: `anim-${Date.now()}`,
          preset: "fade-up",
          trigger: "scroll",
          duration: 0.6,
          delay: 0,
          repeat: false,
        },
      ],
    });
  };

  const updateAnim = (id: string, updates: Partial<AnimationConfig>) => {
    if (!element) return;
    updateComp(element.id, {
      animations: animations.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    });
  };

  const removeAnim = (id: string) => {
    if (!element) return;
    updateComp(element.id, {
      animations: animations.filter((a) => a.id !== id),
    });
  };

  if (!primaryId || !element) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.07] py-10 text-center">
        <Sparkles className="mb-2 h-6 w-6 text-white/10" />
        <p className="text-[10px] font-semibold text-white/30">
          Select a layer to add motion
        </p>
        <p className="mt-1 text-[9px] text-white/15">
          Framer Motion animations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
            Animations
          </p>
          <p className="text-[10px] text-white/50">{element.type}</p>
        </div>
        <button
          onClick={addAnimation}
          className="flex h-6 items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 text-[9px] font-bold text-white/30 transition hover:border-violet-500/30 hover:text-violet-400"
        >
          <Plus className="h-2.5 w-2.5" /> Add
        </button>
      </div>

      {animations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.07] p-6 text-center">
          <Zap className="mx-auto mb-2 h-5 w-5 text-white/10" />
          <p className="text-[10px] text-white/25">No animations yet</p>
          <p className="mt-1 text-[9px] text-white/15">
            Click Add to bring this layer to life
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {animations.map((anim, index) => (
            <div
              key={anim.id}
              className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2.5"
            >
              <button
                onClick={() => removeAnim(anim.id)}
                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md text-white/15 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600/20 text-[9px] font-bold text-violet-400">
                  {index + 1}
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">
                  Animation Layer
                </p>
              </div>

              {/* Preset */}
              <div>
                <p className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Preset
                </p>
                <select
                  value={anim.preset}
                  onChange={(e) =>
                    updateAnim(anim.id, { preset: e.target.value })
                  }
                  className={SEL}
                >
                  {Object.entries(ANIMATION_PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[9px] text-white/25">
                  {ANIMATION_PRESETS[anim.preset]?.description}
                </p>
              </div>

              {/* Trigger */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                    Trigger
                  </p>
                  <select
                    value={anim.trigger}
                    onChange={(e) =>
                      updateAnim(anim.id, {
                        trigger: e.target.value as AnimationTrigger,
                      })
                    }
                    className={SEL}
                  >
                    <option value="load">On Load</option>
                    <option value="scroll">On Scroll</option>
                    <option value="hover">On Hover</option>
                    <option value="tap">On Tap</option>
                  </select>
                </div>
                {anim.trigger === "scroll" && (
                  <div className="flex flex-col justify-end pb-1">
                    <Toggle
                      checked={anim.repeat || false}
                      onChange={(v) => updateAnim(anim.id, { repeat: v })}
                      label="Repeat"
                    />
                  </div>
                )}
              </div>

              {/* Timing */}
              {(anim.trigger === "load" || anim.trigger === "scroll") && (
                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-2.5">
                  {[
                    {
                      label: "Delay",
                      icon: Clock,
                      key: "delay" as const,
                      min: 0,
                      max: 2,
                      val: anim.delay ?? 0,
                    },
                    {
                      label: "Duration",
                      icon: FastForward,
                      key: "duration" as const,
                      min: 0.1,
                      max: 3,
                      val: anim.duration ?? 0.6,
                    },
                  ].map(({ label, icon: Icon, key, min, max, val }) => (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                          <Icon className="h-2.5 w-2.5" />
                          {label}
                        </div>
                        <span className="font-mono text-[9px] text-white/30">
                          {val.toFixed(1)}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={0.1}
                        value={val}
                        onChange={(e) =>
                          updateAnim(anim.id, {
                            [key]: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-violet-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
