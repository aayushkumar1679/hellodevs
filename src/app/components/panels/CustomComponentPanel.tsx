"use client";

import React, { useState } from "react";
import { Code2, Plus, Trash2, Package, Sparkles } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomComponentPanel() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const addCustomComponent = useProjectStore((state) => state.addCustomComponent);
  const removeCustomComponent = useProjectStore((state) => state.removeCustomComponent);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("custom");
  const [code, setCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = () => {
    if (!name.trim() || !code.trim()) return;
    addCustomComponent({
      name,
      category,
      code,
      icon: "🧩",
    });
    setName("");
    setCode("");
    setIsRegistering(false);
  };

  const customComponents = Object.values(currentProject?.customComponents || {});

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Package size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Custom Library</h2>
          </div>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>

        <AnimatePresence>
          {isRegistering && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3 pb-2"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Component Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AnimatedFeatureCard"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">React Code (TSX)</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="export default function MyComponent() { ... }"
                  className="w-full h-32 px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-mono focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={!name.trim() || !code.trim()}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Register Component
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {customComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3 border-2 border-dashed border-slate-200">
              <Code2 size={24} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">No custom components</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[160px]">Register your own React snippets to use them in the builder</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {customComponents.map((comp) => (
              <div
                key={comp.id}
                className="group relative bg-white rounded-xl border border-slate-200 p-3 hover:border-indigo-300 hover:shadow-md transition-all cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("polyglot/type", comp.id);
                  e.dataTransfer.setData("polyglot/isCustom", "true");
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-lg border border-slate-100 group-hover:bg-indigo-50 transition">
                    {comp.icon || "🧩"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{comp.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{comp.category}</p>
                  </div>
                  <button
                    onClick={() => removeCustomComponent(comp.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-indigo-600 text-white rounded-t-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={12} className="text-amber-300" />
          <p className="text-[10px] font-black uppercase tracking-wider">AI Developer Mode</p>
        </div>
        <p className="text-[9px] text-white/80 leading-relaxed">
          Custom components are automatically analyzed by Polyglot AI and can be requested in your prompts.
        </p>
      </div>
    </div>
  );
}
