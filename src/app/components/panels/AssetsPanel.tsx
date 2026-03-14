"use client";
// AssetsPanel.tsx
import React, { useState } from "react";
import NextImage from "next/image";
import {
  ImageIcon,
  Search,
  Plus,
  Sparkles,
  Upload,
  Wand2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";

const INPUT =
  "w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/70 outline-none transition placeholder:text-white/20 focus:border-violet-500/40 focus:bg-white/[0.07] focus:text-white/90";

export default function AssetsPanel() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"library" | "ai">("library");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentProject, addAsset, updateComponent } = useProjectStore();
  const { selectedElements } = useEditorStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const assets = currentProject?.assets || [];
  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);
    try {
      const res = await fetch("/api/assets/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      const d = await res.json();
      setGeneratedUrl(d.url);
      addAsset({
        id: `gen-${Date.now()}`,
        name: imagePrompt.slice(0, 28),
        url: d.url,
        type: "generation",
        date: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addAsset({
      id: `img-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: "image",
      date: new Date().toISOString(),
    });
  };

  const handleInsert = (url: string) => {
    if (selectedElements.length === 1)
      updateComponent(selectedElements[0], { props: { src: url } });
  };

  return (
    <div className="flex h-full flex-col bg-[#111114] text-white">
      <div className="flex-shrink-0 space-y-2 border-b border-white/[0.06] p-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
            Assets
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.07] text-white/30 transition hover:border-white/15 hover:text-white/60"
          >
            <Upload className="h-3 w-3" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleUpload}
            accept="image/*"
          />
        </div>
        <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
          {(["library", "ai"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all ${tab === t ? "bg-violet-600/80 text-white" : "text-white/25 hover:text-white/50"}`}
            >
              {t === "ai" && <Sparkles className="h-2.5 w-2.5" />}
              {t === "library" ? "Library" : "AI Lab"}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        <AnimatePresence mode="wait">
          {tab === "library" ? (
            <motion.div
              key="lib"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5">
                <Search className="h-3 w-3 text-white/25" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 bg-transparent text-[10px] text-white/60 outline-none placeholder:text-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((asset, i) => (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] hover:border-white/15"
                  >
                    <NextImage
                      src={asset.url}
                      alt={asset.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="120px"
                    />
                    <div className="absolute inset-0 flex items-end bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 p-2">
                      <button
                        onClick={() => handleInsert(asset.url)}
                        className="w-full rounded-md bg-white py-1 text-[8px] font-black uppercase tracking-wide text-slate-950"
                      >
                        Insert
                      </button>
                    </div>
                    {asset.type === "generation" && (
                      <span className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1 py-0.5 text-[7px] font-black uppercase text-slate-950">
                        AI
                      </span>
                    )}
                  </motion.div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.07] text-white/20 transition hover:border-white/15 hover:text-white/40"
                >
                  <Plus className="h-5 w-5" />
                  <p className="mt-1 text-[8px] uppercase tracking-widest">
                    Import
                  </p>
                </button>
              </div>
              {filtered.length === 0 && assets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ImageIcon className="h-8 w-8 text-white/10 mb-2" />
                  <p className="text-[10px] text-white/25">No assets yet</p>
                  <p className="text-[9px] text-white/15 mt-1">
                    Upload an image or generate one with AI
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-amber-500/6 px-2.5 py-2">
                <Sparkles className="h-3 w-3 flex-shrink-0 text-amber-400" />
                <div>
                  <p className="text-[9px] font-black text-amber-400">
                    NVIDIA FLUX.1-dev
                  </p>
                  <p className="text-[8px] text-amber-400/60">
                    Photorealistic image synthesis
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
                  placeholder="Photorealistic glass tower at sunset, cinematic lighting…"
                  className={`${INPUT} resize-none leading-5`}
                />
              </div>
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !imagePrompt.trim()}
                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white shadow-[0_2px_10px_rgba(245,158,11,0.25)] transition hover:-translate-y-0.5 disabled:opacity-40"
              >
                {isGenerating ? (
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
              {error && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/8 px-2.5 py-2 text-[10px] text-rose-400">
                  {error}
                </div>
              )}
              {generatedUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] group">
                  <NextImage
                    src={generatedUrl}
                    alt="Generated"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 p-3">
                    <button
                      onClick={() => handleInsert(generatedUrl)}
                      className="w-full rounded-lg bg-white py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-950"
                    >
                      Insert to Canvas
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              ) : (
                !isGenerating && (
                  <div className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.06] text-white/15">
                    <Wand2 className="h-6 w-6 mb-1 opacity-30" />
                    <p className="text-[8px] uppercase tracking-widest opacity-40">
                      Ready
                    </p>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
