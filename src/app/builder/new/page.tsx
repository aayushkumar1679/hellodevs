"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Zap,
  Globe,
  Layout,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useProjectStore } from "@/state/useProjectStore";
import { materializeGeneratedProject } from "@/utils/projectHydration";
import {
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_OPTIONS,
} from "@/config/openaiModels";
import { motion, AnimatePresence } from "framer-motion";

/* ── Prompt examples ──────────────────────────────────────── */
const TEMPLATES = [
  {
    icon: Zap,
    label: "SaaS",
    prompt:
      "A premium AI SaaS landing page with a floating 3D hero, trust badges, feature grid, pricing tiers, and a strong final CTA. Clean white background with violet accents.",
  },
  {
    icon: Globe,
    label: "Agency",
    prompt:
      "A world-class digital agency site with bold editorial typography, asymmetric case-study cards, team proof section, and a booking CTA. Dark theme with warm gold accents.",
  },
  {
    icon: Layout,
    label: "Startup",
    prompt:
      "A modern fintech startup homepage with glass morphism cards, clean typography, feature comparison grid, testimonials, and confident navy + white palette.",
  },
  {
    icon: ShoppingBag,
    label: "E-Commerce",
    prompt:
      "A luxury fashion e-commerce landing with full-bleed hero image, curated product grid, brand story section, editorial imagery, and a minimal newsletter signup.",
  },
  {
    icon: FileText,
    label: "Blog",
    prompt:
      "A premium editorial blog homepage with magazine-style grid, featured article hero, category pills, author spotlights, and a clean white + black palette.",
  },
];

export default function NewProjectPage() {
  const createProject = useProjectStore((s) => s.createProject);
  const router = useRouter();

  const [name, setName] = useState("My New Website");
  const [prompt, setPrompt] = useState(TEMPLATES[0].prompt);
  const [model, setModel] = useState(DEFAULT_OPENAI_MODEL);
  const [showModels, setShowModels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt]);

  const selectedModel =
    OPENAI_MODEL_OPTIONS.find((m) => m.id === model) ?? OPENAI_MODEL_OPTIONS[0];

  const STAGES = [
    "Analysing brand identity…",
    "Architecting layout…",
    "Crafting design system…",
    "Generating visuals…",
    "Assembling your website…",
  ];

  const handleGenerate = async () => {
    if (!name.trim() || !prompt.trim()) {
      setError("Please add a project name and describe your website.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    // Cycle through stage messages
    let stageIdx = 0;
    setGenStage(STAGES[0]);
    const stageInterval = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, STAGES.length - 1);
      setGenStage(STAGES[stageIdx]);
    }, 2200);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: name.trim(),
          prompt: prompt.trim(),
          model,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const materialized = materializeGeneratedProject(data);
      const projectId = createProject(name.trim());

      useProjectStore.setState((state) => {
        if (!state.currentProject) return state;
        const updated = {
          ...state.currentProject,
          name: data.projectName ?? name.trim(),
          components: materialized.components,
          rootOrder: materialized.rootOrder,
          rootComponent: materialized.rootOrder[0] ?? null,
          generationPrompt: prompt.trim(),
          generationModel: model,
          generationSummary: data.summary,
          designSystem: data.designSystem,
        };
        return {
          currentProject: updated,
          projects: { ...state.projects, [updated.id]: updated },
        };
      });

      router.push(`/builder/${projectId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      toast.error(msg);
    } finally {
      clearInterval(stageInterval);
      setIsGenerating(false);
      setGenStage(null);
    }
  };

  const handleBlank = () => {
    const projectId = createProject(name.trim() || "Untitled Project");
    router.push(`/builder/${projectId}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#070709] font-sans selection:bg-violet-500/25">
      {/* ── Background atmosphere ──────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[80px]" />
        <div className="absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-violet-800/8 blur-[60px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#070709_100%)]" />
      </div>

      {/* ── Header ──────────────────────────────────────── */}
      <header className="relative z-10 flex h-12 items-center justify-between border-b border-white/[0.06] px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_12px_rgba(124,110,248,0.5)]">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Polyglot
          </span>
        </Link>
        <Link
          href="/"
          className="text-[11px] font-medium text-white/30 transition hover:text-white/60"
        >
          ← Dashboard
        </Link>
      </header>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-12 lg:py-16">
        <div className="w-full max-w-2xl">
          {/* Hero title */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0, 0, 1] }}
            className="mb-8 text-center"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
              <Sparkles className="h-3 w-3" /> AI-First Builder
            </div>
            <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">
              Describe your website.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Watch it appear.
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-white/40">
              One sentence → full page with real images, animations, and a
              design system. Then edit visually.
            </p>
          </motion.div>

          {/* ── Card ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0, 0, 1] }}
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E0E12] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
          >
            {/* Project name row */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 whitespace-nowrap">
                Project
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Launch Site"
                className="flex-1 bg-transparent text-[13px] font-semibold text-white/80 outline-none placeholder:text-white/20 focus:text-white"
              />
            </div>

            {/* Template chips */}
            <div className="flex flex-wrap gap-1.5 border-b border-white/[0.06] px-4 py-3">
              {TEMPLATES.map(({ icon: Icon, label, prompt: p }) => (
                <button
                  key={label}
                  onClick={() => setPrompt(p)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition-all ${
                    prompt === p
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:border-white/15 hover:text-white/60"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Prompt textarea */}
            <div className="px-4 py-3">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-white/25">
                Describe your website
              </p>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A luxury hotel website with parallax hero, warm amber palette, booking form, gallery, and animated section reveals…"
                className="min-h-[100px] w-full resize-none bg-transparent text-[13px] leading-6 text-white/70 outline-none placeholder:text-white/20 focus:text-white/90"
                style={{ overflow: "hidden" }}
              />
            </div>

            {/* Model selector */}
            <div className="border-t border-white/[0.06] px-4 py-2.5">
              <div className="relative">
                <button
                  onClick={() => setShowModels((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[11px] transition hover:border-white/12 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    <span className="font-semibold text-white/60">
                      {selectedModel.label}
                    </span>
                    <span className="text-white/25">
                      {selectedModel.description}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: showModels ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronDown className="h-3 w-3 text-white/30" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showModels && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-full left-0 right-0 z-50 mb-1 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1A1A1E] shadow-2xl"
                    >
                      {OPENAI_MODEL_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setModel(option.id);
                            setShowModels(false);
                          }}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
                        >
                          <div
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${model === option.id ? "bg-violet-400" : "bg-white/15"}`}
                          />
                          <div>
                            <p className="text-[11px] font-semibold text-white/70">
                              {option.label}
                            </p>
                            <p className="text-[10px] text-white/30">
                              {option.description}
                            </p>
                          </div>
                          {model === option.id && (
                            <CheckCircle2 className="ml-auto h-3 w-3 text-violet-400" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-rose-500/15 bg-rose-500/8 px-4 py-2.5 text-[11px] font-medium text-rose-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA row */}
            <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3">
              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating}
                whileTap={{ scale: 0.97 }}
                className="group relative flex flex-1 h-9 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-[12px] font-bold text-white shadow-[0_4px_20px_rgba(124,110,248,0.35)] transition-all hover:shadow-[0_6px_28px_rgba(124,110,248,0.5)] disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={genStage}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="text-[11px]"
                      >
                        {genStage}
                      </motion.span>
                    </AnimatePresence>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" />
                    Generate website
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
                {/* Shimmer */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.button>

              <button
                onClick={handleBlank}
                disabled={isGenerating}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-semibold text-white/40 transition hover:border-white/15 hover:text-white/60 disabled:opacity-40"
              >
                Blank canvas
              </button>
            </div>
          </motion.div>

          {/* Footer hints */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-6 text-[10px] text-white/20"
          >
            {[
              "AI-generated images",
              "Framer Motion animations",
              "One-click export",
            ].map((feat) => (
              <span key={feat} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-violet-500/50" />
                {feat}
              </span>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
