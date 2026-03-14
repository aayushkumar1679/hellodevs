"use client";

import React, { useMemo } from "react";
import { Sparkles, Trash2, Plus, FastForward, Clock, Wand2, ArrowRight } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { ANIMATION_PRESETS, AnimationConfig, AnimationTrigger } from "@/config/animationPresets";

export default function InteractionsPanel() {
  const selectedElements = useEditorStore((state) => state.selectedElements);
  const elements = useProjectStore((state) => state.currentProject?.components);
  const updateComponent = useProjectStore((state) => state.updateComponent);
  const primaryId = selectedElements[0];
  const element = primaryId ? elements?.[primaryId] : null;

  const animations: AnimationConfig[] = useMemo(() => {
    return element?.animations || [];
  }, [element]);

  const addAnimation = () => {
    if (!element) return;
    const newAnim: AnimationConfig = {
      id: `anim-${Date.now()}`,
      preset: Object.keys(ANIMATION_PRESETS)[0],
      trigger: "scroll",
      duration: 0.6,
      delay: 0,
      repeat: false,
    };
    updateComponent(element.id, { animations: [...animations, newAnim] });
  };

  const updateAnimation = (id: string, updates: Partial<AnimationConfig>) => {
    if (!element) return;
    const newAnims = animations.map((a) => (a.id === id ? { ...a, ...updates } : a));
    updateComponent(element.id, { animations: newAnims });
  };

  const removeAnimation = (id: string) => {
    if (!element) return;
    const newAnims = animations.filter((a) => a.id !== id);
    updateComponent(element.id, { animations: newAnims });
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
          Pick a layer on the canvas to add beautiful Framer Motion animations and interactions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.95))] p-5 shadow-[0_24px_60px_-40px_rgba(14,165,233,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Motion Studio
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              Framer Motion Animations
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Stack multiple animations and triggers to build complex micro-interactions seamlessly.
            </p>
          </div>
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-600">
            <Wand2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Active Animations
          </h3>
          <button 
            onClick={addAnimation}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <Plus size={10} /> Add
          </button>
        </div>

        {animations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50">
            <p className="text-xs font-semibold text-slate-600">No animations yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Add an animation to bring this layer to life.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {animations.map((anim, index) => (
              <div key={anim.id} className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                <button 
                  onClick={() => removeAnimation(anim.id)} 
                  className="absolute right-3 top-3 h-6 w-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-100"
                >
                  <Trash2 size={12} />
                </button>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Animation Layer</p>
                </div>

                <div className="space-y-4">
                  {/* Preset Selection */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Preset
                    </label>
                    <div className="relative">
                      <select
                        value={anim.preset}
                        onChange={(e) => updateAnimation(anim.id, { preset: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                      >
                        {Object.entries(ANIMATION_PRESETS).map(([key, preset]) => (
                          <option key={key} value={key}>{preset.name}</option>
                        ))}
                      </select>
                      <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-slate-400 rotate-90" />
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-500">
                      {ANIMATION_PRESETS[anim.preset]?.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Trigger */}
                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Trigger
                      </label>
                      <select
                        value={anim.trigger}
                        onChange={(e) => updateAnimation(anim.id, { trigger: e.target.value as AnimationTrigger })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-teal-500"
                      >
                        <option value="load">On Load</option>
                        <option value="scroll">On Scroll In View</option>
                        <option value="hover">While Hover</option>
                        <option value="tap">While Tap</option>
                      </select>
                    </div>

                    {/* Behavior toggles */}
                    {anim.trigger === "scroll" && (
                      <div className="flex flex-col justify-end pb-3">
                        <label className="flex items-center gap-2 cursor-pointer group/toggle">
                          <input 
                            type="checkbox" 
                            checked={anim.repeat || false}
                            onChange={(e) => updateAnimation(anim.id, { repeat: e.target.checked })}
                            className="hidden"
                          />
                          <div className={`h-4 w-7 rounded-full transition-colors flex items-center p-0.5 ${anim.repeat ? 'bg-teal-500' : 'bg-slate-200'}`}>
                            <div className={`h-3 w-3 rounded-full bg-white transition-transform ${anim.repeat ? 'translate-x-3' : 'translate-x-0'}`} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover/toggle:text-slate-900 transition-colors">Repeat</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Timing for load/scroll */}
                  {(anim.trigger === "load" || anim.trigger === "scroll") && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <Clock size={10} /> Delay
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-50 px-1 rounded">{anim.delay?.toFixed(1) || "0.0"}s</span>
                        </div>
                        <input
                          type="range"
                          min="0" max="2" step="0.1"
                          value={anim.delay || 0}
                          onChange={(e) => updateAnimation(anim.id, { delay: parseFloat(e.target.value) })}
                          className="w-full accent-teal-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <FastForward size={10} /> Duration
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-50 px-1 rounded">{anim.duration?.toFixed(1) || "0.0"}s</span>
                        </div>
                        <input
                          type="range"
                          min="0.1" max="3" step="0.1"
                          value={anim.duration || 0.6}
                          onChange={(e) => updateAnimation(anim.id, { duration: parseFloat(e.target.value) })}
                          className="w-full accent-teal-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
