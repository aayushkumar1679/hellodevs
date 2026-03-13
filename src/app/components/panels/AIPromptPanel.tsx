"use client";

import React, { useState, useTransition } from "react";
import {
  Sparkles,
  Wand2,
  Layers3,
  Boxes,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useCanvasStore } from "@/state/useCanvasStore";
import {
  materializeGeneratedProject,
  type GeneratedProjectPayload,
} from "@/utils/projectHydration";
import {
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_OPTIONS,
} from "@/config/openaiModels";

const PROMPT_IDEAS = [
  "A light-themed AI product landing page with a floating 3D hero illustration, strong typography, customer logos, pricing, and a final call-to-action.",
  "A premium fintech homepage with layered cards, trust badges, a comparison grid, and subtle depth effects.",
  "A modern design studio site with asymmetric sections, case-study cards, testimonials, and bright editorial styling.",
];

export default function AIPromptPanel() {
  const currentProject = useCanvasStore((state) => state.currentProject);
  const hydrateCurrentProject = useCanvasStore(
    (state) => state.hydrateCurrentProject
  );

  const [prompt, setPrompt] = useState(
    currentProject?.generationPrompt || PROMPT_IDEAS[0]
  );
  const [model, setModel] = useState(
    currentProject?.generationModel || DEFAULT_OPENAI_MODEL
  );
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(
    currentProject?.generationSummary || null
  );
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!currentProject) return;

    setError(null);

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            projectName: currentProject.name,
            model,
          }),
        });

        const data = (await response.json()) as
          | GeneratedProjectPayload
          | { error?: string };

        if (!response.ok || !("roots" in data)) {
          setError(
            "error" in data && data.error
              ? data.error
              : "Generation failed. Please try a more specific prompt."
          );
          return;
        }

        const materialized = materializeGeneratedProject(data);
        hydrateCurrentProject({
          name: data.projectName || currentProject.name,
          components: materialized.components,
          rootOrder: materialized.rootOrder,
          rootComponent: materialized.rootOrder[0] || null,
          designElements: materialized.designElements,
          generationPrompt: prompt,
          generationModel: model,
          generationSummary: data.summary,
        });
        setSummary(data.summary || "Fresh layout generated.");
      })().catch((generationError) => {
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Unexpected generation error."
        );
      });
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 backdrop-blur-md">
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.2)]">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Polyglot AI
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
              Prompt the Future
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Describe your vision. Polyglot transforms ideas into <span className="text-slate-950 font-semibold underline decoration-amber-500/30 decoration-2">deterministic Next.js layouts.</span>
            </p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-1">
            Intelligence Model
          </label>
          <div className="grid gap-2">
            {OPENAI_MODEL_OPTIONS.map((option) => {
              const active = model === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setModel(option.id)}
                  className={`group relative flex w-full items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition-all duration-300 ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white shadow-xl scale-[1.02]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                    active ? "bg-white/10" : "bg-slate-100 group-hover:bg-slate-200"
                  }`}>
                    <Wand2 className={`h-5 w-5 ${active ? "text-amber-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{option.label}</p>
                    <p className={`text-[11px] leading-tight mt-0.5 ${active ? "text-slate-400" : "text-slate-500"}`}>
                      {option.description}
                    </p>
                  </div>
                  {active && (
                    <div className="ml-auto">
                      <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-1">
            Design Prompt
          </label>
          <div className="relative group/input rounded-[32px] border border-slate-200 bg-white p-2 shadow-sm focus-within:ring-4 focus-within:ring-slate-950/5 focus-within:border-slate-950 transition-all">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A dark SaaS dashboard with floating glass cards and indigo accents..."
              className="w-full min-h-[160px] resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
            />
            
            <div className="flex flex-wrap gap-1.5 p-2">
              {PROMPT_IDEAS.map((idea) => (
                <button
                  key={idea}
                  onClick={() => setPrompt(idea)}
                  className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500 transition-all hover:bg-slate-950 hover:text-white hover:border-slate-950"
                >
                  {idea.split(" ").slice(0, 3).join(" ")}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Value Props */}
        <div className="grid gap-2">
          <div className="flex items-center gap-3 rounded-2xl bg-white/50 border border-white/80 p-3 text-[11px] text-slate-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Layers3 className="h-3.5 w-3.5" />
            </div>
            Direct-to-Canvas Component Mapping
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/50 border border-white/80 p-3 text-[11px] text-slate-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Boxes className="h-3.5 w-3.5" />
            </div>
            Deterministic Tailwind Layouts
          </div>
        </div>

        {/* Feedback Messages */}
        {summary && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-emerald-800 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{summary}</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-700">
             {error}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/80 p-5 backdrop-blur-xl">
        <button
          onClick={handleGenerate}
          disabled={isPending || !currentProject || !prompt.trim()}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[24px] bg-slate-950 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Architecting Canvas...</span>
            </>
          ) : (
            <>
              <span>Generate Experience</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
