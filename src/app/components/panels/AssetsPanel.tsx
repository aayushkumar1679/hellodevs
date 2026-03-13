"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { ImageIcon, Search, Plus, Sparkles, Upload, MoreHorizontal, Filter } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: "image" | "generation";
  date: string;
}

const MOCK_ASSETS: Asset[] = [
  { id: "1", name: "Modern Hero", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", type: "image", date: "2024-03-10" },
  { id: "2", name: "Glassmorphism Card", url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop", type: "generation", date: "2024-03-11" },
  { id: "3", name: "Abstract Mesh", url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop", type: "image", date: "2024-03-12" },
  { id: "4", name: "Tech Icons", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop", type: "generation", date: "2024-03-13" },
];

export default function AssetsPanel() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "generation">("all");

  const filteredAssets = MOCK_ASSETS.filter(asset => 
    (activeFilter === "all" || asset.type === activeFilter) &&
    asset.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 p-6">
        <header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Media
                </p>
                <h3 className="text-sm font-semibold text-slate-950">Assets Library</h3>
              </div>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950 shadow-sm">
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-300 transition-all">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {["all", "image", "generation"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type as "all" | "image" | "generation")}
              className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeFilter === type
                  ? "bg-slate-950 text-white shadow-md"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="group relative aspect-square cursor-pointer overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 transition-all hover:border-slate-400 hover:shadow-xl">
              <NextImage
                src={asset.url}
                alt={asset.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>

              {asset.type === "generation" && (
                <div className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/90 text-amber-950 shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <p className="truncate text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                  {asset.name}
                </p>
                <button className="mt-2 w-full rounded-full bg-white py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-950 transition hover:bg-slate-50">
                  Insert
                </button>
              </div>
            </div>
          ))}

          <button className="flex aspect-square flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 transition-all hover:bg-slate-100 hover:border-slate-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-400">
               <Plus className="h-5 w-5" />
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Upload</p>
          </button>
        </div>

        {filteredAssets.length === 0 && (
           <div className="mt-8 text-center text-slate-400">
             <p className="text-xs font-medium">No assets found</p>
           </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50/50 p-6">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Pro Tip</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-950">Generate images with AI</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            Ask the Polyglot assistant to generate specific image assets or mesh gradients for your sections.
          </p>
        </div>
      </div>
    </div>
  );
}
