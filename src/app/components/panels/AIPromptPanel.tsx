"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import {
  Sparkles,
  Wand2,
  Loader2,
  X,
  Image as ImageIcon,
  Globe,
  Link as LinkIcon,
  ScanLine,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import type { PolyglotProject } from "@/state/useProjectStore";
import {
  materializeGeneratedProject,
  type GeneratedProjectPayload,
} from "@/utils/projectHydration";
import {
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_OPTIONS,
} from "@/config/openaiModels";
import { DEFAULT_DESIGN_SYSTEM } from "@/config/DesignSystem";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import ScreenshotDropzone from "./ScreenshotDropzone";

type Tab = "generate" | "image" | "screenshot" | "clone";

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "generate", icon: Sparkles, label: "Generate" },
  { id: "image", icon: ImageIcon, label: "Image" },
  { id: "screenshot", icon: ScanLine, label: "Vision" },
  { id: "clone", icon: Globe, label: "Clone" },
];

const QUICK_PROMPTS = [
  "SaaS landing — dark, violet",
  "Fintech — glass cards, trust",
  "Agency — editorial, bold",
  "E-commerce — luxury fashion",
];

/* ── Dark input shared class ─────────────────────────────── */
const INPUT =
  "w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/70 outline-none transition placeholder:text-white/20 focus:border-violet-500/40 focus:bg-white/[0.07] focus:text-white/90";
const SEL = `${INPUT} appearance-none cursor-pointer`;
const BTN =
  "flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40";

export default function AIPromptPanel() {
  const currentProject = useProjectStore((s) => s.currentProject);

  const bulkHydrate = (payload: Partial<PolyglotProject>) => {
    useProjectStore.setState((state) => {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, ...payload };
      return {
        currentProject: updated,
        projects: { ...state.projects, [updated.id]: updated },
      };
    });
  };

  const [tab, setTab] = useState<Tab>("generate");
  const [prompt, setPrompt] = useState(
    currentProject?.generationPrompt || QUICK_PROMPTS[0],
  );
  const [model, setModel] = useState(
    currentProject?.generationModel || DEFAULT_OPENAI_MODEL,
  );
  const [mode, setMode] = useState<"new" | "update">("new");
  const [summary, setSummary] = useState<string | null>(
    currentProject?.generationSummary || null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLog, setStreamLog] = useState("");
  const [manifestingImages, setManifestingImages] = useState(false);
  const [, startTransition] = useTransition();
  const logRef = useRef<HTMLDivElement>(null);

  // Image gen
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenImg, setIsGenImg] = useState(false);
  const [genImgUrl, setGenImgUrl] = useState<string | null>(null);
  const [imgErr, setImgErr] = useState<string | null>(null);

  // Clone
  const [cloneUrl, setCloneUrl] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamLog]);

  const resolveDesignSystem = (
    incoming?: GeneratedProjectPayload["designSystem"],
  ) => {
    if (incoming?.colors) {
      return {
        ...DEFAULT_DESIGN_SYSTEM,
        ...(currentProject?.designSystem ?? {}),
        colors: {
          ...DEFAULT_DESIGN_SYSTEM.colors,
          ...(currentProject?.designSystem?.colors ?? {}),
          ...incoming.colors,
        },
      };
    }
    return currentProject?.designSystem ?? DEFAULT_DESIGN_SYSTEM;
  };

  const handleGenerate = () => {
    if (!currentProject) return;
    setError(null);
    setSummary(null);
    setStreamLog("");
    setIsStreaming(true);
    startTransition(() => {
      void (async () => {
        try {
          const body: {
            prompt: string;
            projectName: string;
            model: string;
            mode?: "iterate";
            currentLayout?: string;
          } = { prompt, projectName: currentProject.name, model };
          if (mode === "update") {
            body.mode = "iterate";
            const slim: Record<
              string,
              {
                type: string;
                props: Record<string, unknown>;
                css?: Record<string, unknown>;
                children: string[];
              }
            > = {};
            Object.entries(currentProject.components).forEach(([id, c]) => {
              slim[id] = {
                type: c.type,
                props: c.props,
                css: c.cssOverrides?.base,
                children: c.children,
              };
            });
            body.currentLayout = JSON.stringify({
              components: slim,
              rootOrder: currentProject.rootOrder,
              designSystem: currentProject.designSystem,
            });
          }

          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Generation failed");
          }

          const reader = res.body?.getReader();
          if (!reader) throw new Error("No reader");

          let full = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = new TextDecoder().decode(value);
            full += chunk;
            setStreamLog((p) => p + chunk);
          }
          setIsStreaming(false);

          let jsonStr = full;
          const m =
            full.match(/```json\n([\s\S]*?)\n```/) || full.match(/\{[\s\S]*\}/);
          if (m) jsonStr = m[1] || m[0];

          const data: GeneratedProjectPayload = JSON.parse(jsonStr);
          const materialized = materializeGeneratedProject(data);
          bulkHydrate({
            name: data.projectName || currentProject.name,
            components: materialized.components,
            rootOrder: materialized.rootOrder,
            rootComponent: materialized.rootOrder[0] || null,
            generationPrompt: prompt,
            generationModel: model,
            generationSummary: data.summary,
            designSystem: resolveDesignSystem(data.designSystem),
          });
          setSummary(data.summary || "Layout generated.");

          // Auto-image generation
          const tasks: Promise<void>[] = [];
          Object.values(materialized.components).forEach((comp) => {
            if (comp.type === "image" && comp.props?.imagePrompt) {
              setManifestingImages(true);
              const imgP = comp.props.imagePrompt as string;
              tasks.push(
                fetch("/api/assets/generate-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ prompt: imgP }),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.url) {
                      useProjectStore.getState().updateComponent(comp.id, {
                        props: { ...comp.props, src: d.url },
                      });
                      useProjectStore.getState().addAsset({
                        id: `gen-auto-${Date.now()}`,
                        name: imgP.slice(0, 28),
                        url: d.url,
                        type: "generation",
                        date: new Date().toISOString(),
                      });
                    }
                  })
                  .catch(() => {}),
              );
            }
          });
          if (tasks.length)
            Promise.allSettled(tasks).then(() => setManifestingImages(false));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unexpected error";
          setError(msg);
          toast.error(msg);
          setIsStreaming(false);
          setManifestingImages(false);
        }
      })();
    });
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenImg(true);
    setImgErr(null);
    setGenImgUrl(null);
    try {
      const res = await fetch("/api/assets/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      const d = await res.json();
      setGenImgUrl(d.url);
      useProjectStore.getState().addAsset({
        id: `gen-${Date.now()}`,
        name: imagePrompt.slice(0, 28),
        url: d.url,
        type: "generation",
        date: new Date().toISOString(),
      });
    } catch (e) {
      setImgErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setIsGenImg(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#111114] text-white">
      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center gap-0.5 border-b border-white/[0.06] px-2 py-1.5">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${
              tab === id
                ? "bg-violet-600/80 text-white"
                : "text-white/25 hover:bg-white/[0.04] hover:text-white/50"
            }`}
          >
            <Icon className="h-2.5 w-2.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Panel content ─────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Generate Tab ──────────────────────────────── */}
          {tab === "generate" && (
            <motion.div
              key="gen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="space-y-3"
            >
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
                {(["new", "update"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-md py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${mode === m ? "bg-violet-600/80 text-white" : "text-white/30 hover:text-white/50"}`}
                  >
                    {m === "new" ? "New Layout" : "Iterate"}
                  </button>
                ))}
              </div>

              {/* Quick prompts */}
              <div className="flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className={`rounded-md border px-2 py-0.5 text-[9px] font-medium transition-all ${prompt === p ? "border-violet-500/40 bg-violet-500/10 text-violet-300" : "border-white/[0.07] text-white/25 hover:border-white/15 hover:text-white/50"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Prompt textarea */}
              <div>
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                  Prompt
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="Describe the website you want to build…"
                  className={`${INPUT} resize-none leading-5`}
                />
              </div>

              {/* Model */}
              <div>
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                  Model
                </p>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={SEL}
                >
                  {OPENAI_MODEL_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/8 px-2.5 py-2 text-[10px] text-rose-400">
                  <X className="h-3 w-3 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Success summary */}
              {summary && !error && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-2 text-[10px] text-emerald-400">
                  ✓ {summary}
                </div>
              )}

              {/* Image manifesting indicator */}
              {manifestingImages && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-2.5 py-2 text-[10px] text-amber-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Generating images
                  in background…
                </div>
              )}

              {/* Stream log */}
              {isStreaming && streamLog && (
                <div
                  className="rounded-lg border border-white/[0.06] bg-black/30 p-2"
                  style={{ maxHeight: 120, overflowY: "auto" }}
                >
                  <pre className="text-[9px] leading-4 text-white/30 font-mono whitespace-pre-wrap break-all">
                    {streamLog.slice(-600)}
                  </pre>
                  <div ref={logRef} />
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isStreaming || !prompt.trim()}
                className={`${BTN} bg-violet-600 text-white shadow-[0_2px_12px_rgba(124,110,248,0.3)] hover:bg-violet-500 hover:shadow-[0_4px_20px_rgba(124,110,248,0.4)]`}
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" />{" "}
                    {mode === "new" ? "Generate Website" : "Iterate Layout"}
                  </>
                )}
              </button>

              {currentProject && (
                <button
                  onClick={() => {
                    useProjectStore.getState().updateProject({
                      components: {},
                      rootOrder: [],
                      rootComponent: null,
                    });
                    setSummary(null);
                    setError(null);
                    toast.success("Canvas cleared");
                  }}
                  className={`${BTN} border border-white/[0.07] bg-transparent text-white/30 hover:border-white/15 hover:text-white/50`}
                >
                  <X className="h-3 w-3" /> Clear Canvas
                </button>
              )}
            </motion.div>
          )}

          {/* ── Image Tab ─────────────────────────────────── */}
          {tab === "image" && (
            <motion.div
              key="img"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-amber-500/6 px-2.5 py-2">
                <Zap className="h-3 w-3 flex-shrink-0 text-amber-400" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                    NVIDIA FLUX.1-dev
                  </p>
                  <p className="text-[9px] text-amber-400/60">
                    State-of-the-art image synthesis
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                  Image Prompt
                </p>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  placeholder="Photorealistic glass tower at sunset, cinematic lighting, 8K…"
                  className={`${INPUT} resize-none leading-5`}
                />
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isGenImg || !imagePrompt.trim()}
                className={`${BTN} bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5`}
              >
                {isGenImg ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                    Manifesting…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> Generate Image
                  </>
                )}
              </button>

              {imgErr && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/8 px-2.5 py-2 text-[10px] text-rose-400">
                  {imgErr}
                </div>
              )}

              {genImgUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.06]">
                  <NextImage
                    src={genImgUrl}
                    alt="Generated"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity hover:opacity-100 p-3">
                    <button
                      onClick={() => {
                        const { selectedElements } = useEditorStore.getState();
                        if (selectedElements?.[0])
                          useProjectStore
                            .getState()
                            .updateComponent(
                              selectedElements[0],
                              { props: { src: genImgUrl } },
                            );
                        toast.success("Inserted");
                      }}
                      className="w-full rounded-lg bg-white py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-950 hover:bg-slate-50"
                    >
                      Insert to Canvas
                    </button>
                  </div>
                </div>
              ) : (
                !isGenImg && (
                  <div className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.07] text-white/15">
                    <Sparkles className="h-6 w-6 mb-1 opacity-30" />
                    <p className="text-[9px] uppercase tracking-widest opacity-40">
                      Ready to generate
                    </p>
                  </div>
                )
              )}
            </motion.div>
          )}

          {/* ── Screenshot / Vision Tab ───────────────────── */}
          {tab === "screenshot" && (
            <motion.div
              key="ss"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="space-y-3"
            >
              <div className="rounded-lg border border-violet-500/15 bg-violet-500/6 px-2.5 py-2 text-[10px] text-violet-400">
                Upload a screenshot or wireframe → GPT-4o Vision reconstructs it
                as editable Polyglot components.
              </div>
              <ScreenshotDropzone
                onResult={(json) => {
                  try {
                    const parsed = JSON.parse(json) as GeneratedProjectPayload;
                    const m = materializeGeneratedProject(parsed);
                    useProjectStore.setState((state) => {
                      if (!state.currentProject) return state;
                      const u = {
                        ...state.currentProject,
                        components: m.components,
                        rootOrder: m.rootOrder,
                        rootComponent: m.rootOrder[0] ?? null,
                        generationSummary: parsed.summary,
                        designSystem: resolveDesignSystem(parsed.designSystem),
                      };
                      return {
                        currentProject: u,
                        projects: { ...state.projects, [u.id]: u },
                      };
                    });
                    setSummary(parsed.summary || "Layout reconstructed");
                    setTab("generate");
                    toast.success("Layout reconstructed! ✨");
                  } catch {
                    toast.error("Failed to parse layout");
                  }
                }}
              />
            </motion.div>
          )}

          {/* ── Clone Tab ─────────────────────────────────── */}
          {tab === "clone" && (
            <motion.div
              key="clone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="space-y-3"
            >
              <div className="rounded-lg border border-sky-500/15 bg-sky-500/6 px-2.5 py-2 text-[10px] text-sky-400">
                Paste a URL → AI reconstructs its design structure as editable
                Polyglot components.
              </div>
              <div>
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                  Website URL
                </p>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5 transition focus-within:border-sky-500/40">
                  <LinkIcon className="h-3 w-3 flex-shrink-0 text-white/25" />
                  <input
                    value={cloneUrl}
                    onChange={(e) => setCloneUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 bg-transparent text-[11px] text-white/70 outline-none placeholder:text-white/20"
                  />
                </div>
              </div>
              <button
                disabled={isCloning || !cloneUrl.trim()}
                onClick={async () => {
                  setIsCloning(true);
                  try {
                    const res = await fetch("/api/clone", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: cloneUrl }),
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error);
                    const parsed = data as GeneratedProjectPayload;
                    const m = materializeGeneratedProject(parsed);
                    useProjectStore.setState((state) => {
                      if (!state.currentProject) return state;
                      const u = {
                        ...state.currentProject,
                        components: m.components,
                        rootOrder: m.rootOrder,
                        rootComponent: m.rootOrder[0] ?? null,
                        generationSummary: parsed.summary,
                        designSystem: resolveDesignSystem(parsed.designSystem),
                      };
                      return {
                        currentProject: u,
                        projects: { ...state.projects, [u.id]: u },
                      };
                    });
                    toast.success("Site cloned! 🏗️");
                    setTab("generate");
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : "Clone failed";
                    toast.error(msg);
                  } finally {
                    setIsCloning(false);
                  }
                }}
                className={`${BTN} bg-sky-600 text-white hover:bg-sky-500`}
              >
                {isCloning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cloning…
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5" /> Clone URL
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
