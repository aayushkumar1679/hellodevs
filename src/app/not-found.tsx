"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 selection:bg-sky-500/30">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-sky-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl px-6 text-center"
      >
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/5 shadow-2xl backdrop-blur-3xl"
        >
          <Sparkles className="h-10 w-10 text-sky-400" />
        </motion.div>

        <h1 className="text-8xl font-black tracking-tighter text-white sm:text-9xl">
          404
        </h1>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            This part of the universe is still unmapped.
          </h2>
          <p className="mx-auto max-w-md text-lg font-medium text-slate-400 leading-relaxed">
            The page you are looking for has either drifted out of orbit or never existed in this dimension.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-slate-950 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
          >
            <Home className="h-4.5 w-4.5" />
            Back to Workspace
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-[15px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Return Previous
          </button>
        </div>
      </motion.div>
    </div>
  );
}
