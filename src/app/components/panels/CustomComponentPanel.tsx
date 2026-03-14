"use client";

import React, { useState } from "react";
import { Code2, Plus, Trash2, Package, Sparkles, X } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import { motion, AnimatePresence } from "framer-motion";

const INPUT =
  "w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/70 outline-none transition placeholder:text-white/20 focus:border-violet-500/40 focus:bg-white/[0.07] focus:text-white/90";

export default function CustomComponentPanel() {
  const addCustomComponent = useProjectStore((s) => s.addCustomComponent);
  const removeCustomComponent = useProjectStore((s) => s.removeCustomComponent);
  const currentProject = useProjectStore((s) => s.currentProject);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("custom");
  const [code, setCode] = useState("");

  const handleRegister = () => {
    if (!name.trim() || !code.trim()) return;
    addCustomComponent({ name, category, code, icon: "🧩" });
    setName("");
    setCode("");
    setIsAdding(false);
  };

  const customComponents = Object.values(
    currentProject?.customComponents || {},
  );

  return (
    <div className="flex h-full flex-col bg-[#111114] text-white">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
            Custom Library
          </p>
          <p className="text-[10px] text-white/40">
            {customComponents.length} components
          </p>
        </div>
        <button
          onClick={() => setIsAdding((v) => !v)}
          className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${isAdding ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-white/[0.07] bg-white/[0.03] text-white/30 hover:border-violet-500/30 hover:text-violet-400"}`}
        >
          {isAdding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/[0.06] bg-violet-500/4"
          >
            <div className="space-y-2.5 p-3">
              <div>
                <p className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                  Component Name
                </p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="AnimatedFeatureCard"
                  className={INPUT}
                />
              </div>
              <div>
                <p className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                  React / TSX Code
                </p>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={
                    "export default function MyComp() {\n  return <div>Hello</div>;\n}"
                  }
                  rows={5}
                  className={`${INPUT} resize-none font-mono leading-5 text-[10px]`}
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={!name.trim() || !code.trim()}
                className="flex h-7 w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 text-[10px] font-bold text-white transition hover:bg-violet-500 disabled:opacity-40"
              >
                Register Component
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component list */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-1.5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a30 transparent",
        }}
      >
        {customComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.07] text-white/15">
              <Code2 className="h-5 w-5" />
            </div>
            <p className="text-[10px] text-white/25">No custom components</p>
            <p className="mt-1 text-[9px] text-white/15 max-w-[150px]">
              Register your own React snippets to use in the builder
            </p>
          </div>
        ) : (
          customComponents.map((comp) => (
            <div
              key={comp.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("polyglot/type", comp.id);
                e.dataTransfer.setData("polyglot/isCustom", "true");
              }}
              className="group flex cursor-grab items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:border-white/10"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-base">
                {comp.icon || "🧩"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-white/60">
                  {comp.name}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">
                  {comp.category}
                </p>
              </div>
              <button
                onClick={() => removeCustomComponent(comp.id)}
                className="h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-white/15 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 flex"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-violet-500/15 bg-violet-600/8 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles className="h-2.5 w-2.5 text-amber-400" />
          <p className="text-[8px] font-black uppercase tracking-wider text-violet-400">
            AI Developer Mode
          </p>
        </div>
        <p className="text-[8px] text-white/20 leading-4">
          Custom components are auto-analyzed by Polyglot AI and can be
          requested in your prompts.
        </p>
      </div>
    </div>
  );
}
