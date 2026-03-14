"use client";

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
  Download,
  Check,
  X,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: "image" | "generation";
  date: string;
}

const MOCK_ASSETS: Asset[] = [
  { id: "1", name: "Modern Hero", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop", type: "image", date: "2024-03-10" },
  { id: "2", name: "Glass Card", url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop", type: "generation", date: "2024-03-11" },
  { id: "3", name: "Mesh BG", url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop", type: "image", date: "2024-03-12" },
  { id: "4", name: "Tech UI", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop", type: "generation", date: "2024-03-13" },
];

export default function AssetsPanel() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "ai">("library");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredAssets = MOCK_ASSETS.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const response = await fetch("/api/assets/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await response.json();
      setGeneratedUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 px-3 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-white">
              <ImageIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Media</p>
              <h3 className="text-[12px] font-black text-slate-950 leading-tight">Assets</h3>
            </div>
          </div>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-950 hover:bg-slate-950 hover:text-white transition-all">
            <Upload className="h-3 w-3" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-0.5 gap-0.5">
          {[
            { id: "library" as const, label: "Library" },
            { id: "ai" as const, label: "AI Lab", icon: Sparkles },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-black uppercase tracking-wide transition-all ${
                  active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.icon && <tab.icon size={9} />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3">
        <AnimatePresence mode="wait">
          {activeTab === "library" ? (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 pt-3"
            >
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-slate-400 transition-colors">
                <Search className="h-3 w-3 shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-2">
                {filteredAssets.map((asset, i) => (
                  <motion.div
                    layout
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 hover:border-slate-400 hover:shadow-md transition-all"
                  >
                    <NextImage
                      src={asset.url}
                      alt={asset.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 transition-opacity group-hover:opacity-100 flex flex-col items-center justify-end p-2">
                      <button className="w-full rounded-lg bg-white py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-950 hover:bg-slate-50 transition-all">
                        Insert
                      </button>
                    </div>
                    <div className="absolute top-1.5 left-1.5">
                      {asset.type === "generation" && (
                        <span className="rounded-md bg-amber-400 px-1 py-0.5 text-[7px] font-black text-slate-950 uppercase">AI</span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Upload Button */}
                <button className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white transition-all hover:border-slate-400 hover:bg-slate-50 group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all">
                    <Plus className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Import</p>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ai-lab"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 pt-3"
            >
              {/* NVIDIA Badge */}
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                <Cpu size={11} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-amber-800">NVIDIA FLUX.1-dev</p>
                  <p className="text-[8px] text-amber-600">State-of-the-art image synthesis</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Image Prompt</label>
                <div className="relative rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/10 transition-all">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Photorealistic glass tower at sunset, cinematic..."
                    className="w-full min-h-[90px] resize-none bg-transparent text-[11px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <motion.button
                onClick={handleGenerateImage}
                disabled={isGenerating || !imagePrompt.trim()}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center gap-2 font-black uppercase tracking-[0.15em] text-[10px] shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:translate-y-0 disabled:shadow-none transition-all"
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Manifesting...</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Generate Image</>
                )}
              </motion.button>

              <AnimatePresence>
                {generatedUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-lg group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <NextImage src={generatedUrl} alt="Generated" className="object-cover" fill sizes="(max-width: 768px) 100vw, 300px" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                      <button className="w-full py-2 bg-white rounded-xl text-slate-950 text-[9px] font-black uppercase tracking-wide hover:bg-slate-50 flex items-center justify-center gap-1.5 transition">
                        <Plus size={10} /> Insert to Canvas
                      </button>
                      <button className="w-full py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white text-[9px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 hover:bg-white/30 transition">
                        <Download size={10} /> Download
                      </button>
                    </div>
                    {/* Success badge */}
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                      <Check size={10} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100"
                >
                  <X size={11} className="text-rose-500 shrink-0" />
                  <p className="text-[10px] font-bold text-rose-700 flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
                    <X size={10} />
                  </button>
                </motion.div>
              )}

              {!generatedUrl && !isGenerating && (
                <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 p-6 text-center">
                  <Wand2 size={32} className="mb-2 opacity-20" />
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] opacity-40">Ready for generation</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
