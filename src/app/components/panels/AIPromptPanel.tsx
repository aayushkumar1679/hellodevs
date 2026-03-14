"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import {
  Sparkles,
  Wand2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Terminal,
  X,
  RefreshCw,
  Image as ImageIcon,
  Code2,
  Cpu,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useCanvasStore } from "@/state/useCanvasStore";
import {
  materializeGeneratedProject,
  type GeneratedProjectPayload,
} from "@/utils/projectHydration";
import {
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_OPTIONS,
} from "@/config/openaiModels";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";

const PROMPT_IDEAS = [
  "A light-themed AI product landing page with a floating 3D hero illustration, strong typography, customer logos, pricing, and a final call-to-action.",
  "A premium fintech homepage with layered cards, trust badges, a comparison grid, and subtle depth effects.",
  "A modern design studio site with asymmetric sections, case-study cards, testimonials, and bright editorial styling.",
];

type ActiveTab = "layout" | "image";

export default function AIPromptPanel() {
  const currentProject = useCanvasStore((state) => state.currentProject);
  const hydrateCurrentProject = useCanvasStore((state) => state.hydrateCurrentProject);

  const [activeTab, setActiveTab] = useState<ActiveTab>("layout");
  const [prompt, setPrompt] = useState(currentProject?.generationPrompt || PROMPT_IDEAS[0]);
  const [model, setModel] = useState(currentProject?.generationModel || DEFAULT_OPENAI_MODEL);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(currentProject?.generationSummary || null);
  const [isPending, startTransition] = useTransition();
  const [streamedContent, setStreamedContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [manifestingImages, setManifestingImages] = useState(false);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamedContent]);

  const handleGenerate = () => {
    if (!currentProject) return;
    setError(null);
    setSummary(null);
    setStreamedContent("");
    setIsStreaming(true);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, projectName: currentProject.name, model }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Generation failed.");
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("No reader available.");

          let fullResponse = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = new TextDecoder().decode(value);
            fullResponse += chunk;
            setStreamedContent((prev) => prev + chunk);
          }

          setIsStreaming(false);

          let jsonStr = fullResponse;
          // Robust JSON extraction in case there's markdown ticks
          const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/) || fullResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1] || jsonMatch[0];
          }

          let data: GeneratedProjectPayload;
          try {
             data = JSON.parse(jsonStr) as GeneratedProjectPayload;
          } catch {
             throw new Error("Invalid response format. No JSON found or parsing failed.");
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

          // Background FLUX Image Generation
          const imageTasks: Promise<void>[] = [];
          Object.values(materialized.components).forEach((comp) => {
            if (comp.type === "image" && comp.props?.imagePrompt) {
               setManifestingImages(true);
               const promptToUse = comp.props.imagePrompt as string;
               
               const task = fetch("/api/assets/generate-image", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ prompt: promptToUse }),
               })
                 .then((res) => {
                   if (!res.ok) throw new Error("Image gen failed");
                   return res.json();
                 })
                 .then((imgData) => {
                   if (imgData.url) {
                      useCanvasStore.getState().updateComponent(comp.id, {
                        props: { ...comp.props, src: imgData.url }
                      });
                   }
                 })
                 .catch((err) => console.error("Auto image generation failed for component:", comp.id, err));
               imageTasks.push(task);
            }
          });

          if (imageTasks.length > 0) {
            Promise.allSettled(imageTasks).then(() => {
               setManifestingImages(false);
            });
          }

        } catch (generationError) {
          const msg = generationError instanceof Error ? generationError.message : "Unexpected error.";
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
    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch("/api/assets/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Image generation failed");
      }

      const data = await response.json();
      setGeneratedImageUrl(data.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate image";
      setImageError(msg);
      toast.error(msg);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const isWorking = isStreaming || isPending || manifestingImages;

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-white">
      {/* Ambient gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-400/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-sky-400/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)]">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Polyglot AI</p>
            <h2 className="text-[14px] font-black tracking-tight text-slate-950">Architect Studio</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
          {[
            { id: "layout" as ActiveTab, label: "Layout", icon: Code2 },
            { id: "image" as ActiveTab, label: "Image", icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase tracking-wide transition-all ${
                  active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={11} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "layout" ? (
            <motion.div
              key="layout"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-5 space-y-5"
            >
              {!isWorking && !summary ? (
                <>
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Engine
                    </label>
                    <div className="space-y-1.5">
                      {OPENAI_MODEL_OPTIONS.map((option) => {
                        const active = model === option.id;
                        const isNvidia = option.provider === "nvidia";
                        return (
                          <motion.button
                            key={option.id}
                            onClick={() => setModel(option.id)}
                            className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 ${
                              active
                                ? "border-slate-950 bg-slate-950 text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)]"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                              active ? "bg-white/10" : "bg-slate-100 group-hover:scale-105"
                            }`}>
                              {isNvidia ? (
                                <Cpu className={`h-4 w-4 ${active ? "text-amber-400" : "text-slate-500"}`} />
                              ) : (
                                <Wand2 className={`h-4 w-4 ${active ? "text-amber-400" : "text-slate-500"}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black truncate flex items-center gap-1.5">
                                {option.label}
                                {isNvidia && (
                                  <span className="text-[8px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-black uppercase">
                                    NVIDIA
                                  </span>
                                )}
                              </p>
                              <p className={`text-[9px] truncate mt-0.5 ${active ? "opacity-60" : "text-slate-500"}`}>
                                {option.description}
                              </p>
                            </div>
                            {active && (
                              <motion.div
                                layoutId="active-model-dot"
                                className="h-2 w-2 rounded-full bg-amber-400 animate-pulse-dot shrink-0"
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Creative Direction
                    </label>
                    <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-slate-950 focus-within:ring-4 focus-within:ring-slate-950/5 transition-all">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your design vision..."
                        className="w-full min-h-[120px] resize-none bg-transparent text-[12px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 font-medium"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-50">
                        {PROMPT_IDEAS.map((idea) => (
                          <button
                            key={idea}
                            onClick={() => setPrompt(idea)}
                            className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[8px] font-bold text-slate-500 transition hover:bg-slate-950 hover:text-white hover:border-slate-950 uppercase tracking-wide"
                          >
                            {idea.split(" ").slice(0, 3).join(" ")}…
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    onClick={handleGenerate}
                    disabled={!currentProject || !prompt.trim()}
                    className="group relative flex w-full h-12 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)] transition-all hover:bg-slate-800 hover:-translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:translate-y-0 disabled:shadow-none"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10">
                      Generate Layout
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </>
              ) : summary && !isWorking ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center space-y-5 py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"
                  >
                    <CheckCircle2 size={32} />
                  </motion.div>
                  <div>
                    <h3 className="text-[15px] font-black text-slate-950 tracking-tight">Layout Ready!</h3>
                    <p className="mt-1.5 text-[11px] text-slate-500 max-w-[200px] leading-relaxed">{summary}</p>
                  </div>
                  
                  {manifestingImages && (
                    <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <Loader2 size={12} className="animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Manifesting FLUX Images...</span>
                    </div>
                  )}

                  <button
                    onClick={() => setSummary(null)}
                    disabled={manifestingImages}
                    className="rounded-full border-2 border-slate-950 px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-slate-950 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Another
                  </button>
                </motion.div>
              ) : (
                /* Streaming Screen */
                <motion.div
                  key="streaming"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                        <Terminal size={14} className={isStreaming ? "animate-pulse" : ""} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black text-slate-950 uppercase tracking-wide">Thinking</h3>
                        <p className="text-[9px] text-slate-400 font-bold">
                          {isStreaming ? "STREAMING TOKENS..." : "SYNTHESIZING..."}
                        </p>
                      </div>
                    </div>
                    {isStreaming && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 font-mono text-[10px] leading-relaxed overflow-hidden shadow-xl border border-white/5 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08),transparent)] pointer-events-none" />
                    <div className="h-52 overflow-y-auto no-scrollbar space-y-1 relative">
                      <div className="text-emerald-400/50">&gt; INITIALIZING {model.toUpperCase()}...</div>
                      <div className="text-emerald-400/50">&gt; ANALYZING CONSTRAINTS...</div>
                      <div className="h-px bg-white/5 my-2" />
                      <div className="text-slate-300 break-words whitespace-pre-wrap">
                        {streamedContent || (isPending ? "Awaiting first token..." : "")}
                      </div>
                      <div ref={terminalEndRef} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "2%" }}
                        animate={{ width: isStreaming ? "90%" : "100%" }}
                        transition={{ duration: 28, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-amber-400 to-slate-950 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wide text-slate-400">
                      <span>Logic Synthesis</span>
                      <span>{isStreaming ? "Computing..." : "Complete"}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 rounded-2xl border border-rose-100 bg-rose-50 p-3"
                >
                  <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <p className="text-[11px] font-bold text-rose-700 flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="h-6 w-6 rounded-full bg-white text-slate-400 flex items-center justify-center shadow-sm hover:text-rose-500"
                  >
                    <RefreshCw size={10} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Image Generation Tab */
            <motion.div
              key="image"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-5 space-y-5"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2.5">
                <Cpu size={12} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-amber-800">NVIDIA FLUX.1-dev</p>
                  <p className="text-[9px] text-amber-600">State-of-the-art image synthesis</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Image Prompt</label>
                <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/5 transition-all">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A photorealistic render of a glass tower at sunset, cinematic lighting..."
                    className="w-full min-h-[100px] resize-none bg-transparent text-[12px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <motion.button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="group flex w-full h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_12px_30px_-8px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-8px_rgba(245,158,11,0.5)] disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:translate-y-0 disabled:shadow-none"
                whileTap={{ scale: 0.98 }}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Manifesting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Generate Image</span>
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {generatedImageUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-xl group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <NextImage src={generatedImageUrl} alt="Generated" className="object-cover" fill sizes="(max-width: 768px) 100vw, 300px" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                      <button className="w-full py-2.5 bg-white rounded-xl text-slate-950 text-[10px] font-black uppercase tracking-wide hover:bg-slate-50 transition">
                        Insert to Canvas
                      </button>
                      <button className="w-full py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white text-[10px] font-black uppercase tracking-wide hover:bg-white/30 transition">
                        Download
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!generatedImageUrl && !isGeneratingImage && (
                <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                  <Sparkles size={40} className="mb-3 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Ready to generate</p>
                </div>
              )}

              {imageError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold text-center">
                  {imageError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
