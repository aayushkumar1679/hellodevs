"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  Sparkles,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { materializeGeneratedProject } from "@/utils/projectHydration";
import {
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_OPTIONS,
} from "@/config/openaiModels";

const PROMPT_EXAMPLES = [
  "A premium AI SaaS landing page with a floating 3D hero, trusted by logos, a feature grid, testimonials, pricing, and a strong final CTA.",
  "A modern fintech homepage with glass cards, clean charts, comparison sections, and crisp light-theme spacing.",
  "A world-class agency website with editorial typography, bold asymmetry, work showcase cards, team proof, and a booking CTA.",
];

export default function NewProjectPage() {
  const createProject = useCanvasStore((state) => state.createProject);
  const hydrateCurrentProject = useCanvasStore((state) => state.hydrateCurrentProject);
  const router = useRouter();

  const [name, setName] = useState("Polyglot Test Website");
  const [prompt, setPrompt] = useState(PROMPT_EXAMPLES[0]);
  const [model, setModel] = useState(DEFAULT_OPENAI_MODEL);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const trimmedName = name.trim();
    const trimmedPrompt = prompt.trim();

    if (!trimmedName || !trimmedPrompt) {
      setError("Add a project name and prompt before generating.");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: trimmedName,
          prompt: trimmedPrompt,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      const materialized = materializeGeneratedProject(data);
      const projectId = createProject(trimmedName);

      hydrateCurrentProject({
        name: data.projectName || trimmedName,
        components: materialized.components,
        rootOrder: materialized.rootOrder,
        rootComponent: materialized.rootOrder[0] || null,
        designElements: materialized.designElements,
        generationPrompt: trimmedPrompt,
        generationModel: model,
        generationSummary: data.summary,
      });

      router.push(`/builder/${projectId}`);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Unexpected generation error."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBlankCanvas = () => {
    const trimmedName = name.trim() || "Untitled Project";
    const projectId = createProject(trimmedName);
    router.push(`/builder/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-medium text-slate-500 transition hover:text-slate-950">
            Back to dashboard
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Prompt-first creation
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[36px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.38)]">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            Start with a prompt
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Describe the website before you touch the canvas
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Polyglot should begin like a real AI product: prompt first, generated
            site first, then visual refinement. This screen now does exactly that.
          </p>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Project name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Acme AI launch site"
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Model
              </span>
              <div className="space-y-3">
                {OPENAI_MODEL_OPTIONS.map((option) => {
                  const active = model === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setModel(option.id)}
                      className={`flex w-full items-start gap-3 rounded-[24px] border px-4 py-4 text-left transition ${
                        active
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`mt-1 h-4 w-4 rounded-full border ${
                          active ? "border-white bg-white" : "border-slate-300"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p
                          className={`mt-1 text-sm ${
                            active ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                What should the website look like?
              </span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-56 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                placeholder="Describe the page you want Polyglot to generate..."
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {PROMPT_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                >
                  {example.length > 58 ? `${example.slice(0, 58)}...` : example}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-4 w-4 animate-pulse" />
                    Generating website...
                  </>
                ) : (
                  <>
                    Generate website
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleBlankCanvas}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Blank canvas
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200 bg-[radial-gradient(circle_at_top,#fef3c7,transparent_42%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.38)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                What the generated flow now does
              </p>
              <p className="text-sm text-slate-500">
                Closer to the product vision you described
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm text-slate-600">
            {[
              "Generate a first draft website from the prompt before the builder opens.",
              "Open the builder with a real canvas tree and editable styles already in place.",
              "Rewrite the prompt later from the AI panel to regenerate and refine.",
              "Use the upgraded light-theme inspector to tune CSS, glass, and 3D depth.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[24px] border border-white/80 bg-white/85 px-4 py-4 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
