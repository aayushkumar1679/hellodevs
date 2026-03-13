"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 selection:bg-rose-500/30">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-rose-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-amber-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl px-6 text-center"
      >
        <motion.div 
          animate={{ x: [0, -4, 4, -4, 4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
          className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/30 bg-rose-500/10 shadow-[0_0_50px_-15px_rgba(244,63,94,0.4)] backdrop-blur-3xl"
        >
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </motion.div>

        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Something went wrong.
        </h1>
        
        <p className="mx-auto mt-6 max-w-md text-lg font-medium text-slate-400 leading-relaxed">
          We encountered an unexpected glitch in the matrix. Don&apos;t worry, your work is likely safe.
        </p>

        {error.digest && (
          <p className="mt-4 text-[11px] font-mono text-slate-600 uppercase tracking-widest">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="group flex items-center gap-2 rounded-full bg-rose-500 px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-rose-600 hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(244,63,94,0.4)]"
          >
            <RefreshCcw className="h-4.5 w-4.5 transition-transform group-hover:rotate-180 duration-700" />
            Retry Operation
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-[15px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
          >
            <Home className="h-4.5 w-4.5" />
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
