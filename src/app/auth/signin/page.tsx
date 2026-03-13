"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Sparkles, Mail, Github, Chrome, ArrowRight, Loader2 } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading("google");
    try {
      await signIn("google", { callbackUrl: "/builder/new" });
    } catch (error) {
      console.error("Google Sign-in Error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading("email");
    try {
      await signIn("email", { email, callbackUrl: "/builder/new" });
    } catch (error) {
      console.error("Email Sign-in Error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-amber-500/30">
      {/* Background Layer: Premium Mesh Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-indigo-600/30 blur-[140px] animate-[pulse_8s_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-amber-600/20 blur-[140px] animate-[pulse_10s_infinite]" />
        <div className="absolute top-[30%] left-[20%] h-[40%] w-[40%] rounded-full bg-rose-600/10 blur-[120px] animate-pulse" />
        
        {/* Mesh Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
      </div>

      {/* Floating 3D Elements (Decorative) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] opacity-20 animate-bounce">
           <div className="h-24 w-24 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-3xl rotate-12 shadow-2xl" />
        </div>
        <div className="absolute bottom-[20%] right-[15%] opacity-10 animate-pulse">
           <div className="h-32 w-32 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl -rotate-12 shadow-2xl" />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo Section */}
        <div className="mb-12 text-center">
          <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-amber-500 to-rose-500 blur-2xl opacity-40 animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-3xl">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white sm:text-6xl">
            POLYGLOT
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-400">
            Build the future of the web, <span className="text-amber-500/80">deterministically.</span>
          </p>
        </div>

        {/* Auth Card */}
        <div className="group relative rounded-[48px] border border-white/10 bg-white/5 p-8 shadow-[0_32px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur-3xl transition-all duration-700 hover:border-white/20">
          {/* Top highlight line */}
          <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          
          <div className="space-y-8">
            {/* Google Provider */}
            <button
              onClick={handleGoogleSignIn}
              disabled={!!loading}
              className="group/btn relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-[28px] border border-white/10 bg-white px-6 py-5 text-base font-bold text-slate-950 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading === "google" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Chrome className="h-6 w-6 fill-current transition-transform group-hover/btn:rotate-12" />
              )}
              Continue with Google
            </button>

            {/* Separator w/ Glass Effect */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Secure Magic Link
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-5">
              <div className="relative group/input">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                  <Mail className="h-5 w-5 text-slate-500 transition-colors group-focus-within/input:text-amber-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="block w-full rounded-[28px] border border-white/10 bg-white/5 py-5 pl-14 pr-6 text-base text-white outline-none ring-amber-500/40 transition-all placeholder:text-slate-600 focus:border-amber-500/50 focus:bg-white/10 focus:ring-4"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!!loading}
                className="group/magic relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[28px] bg-gradient-to-r from-amber-500 to-rose-500 py-5 text-base font-black text-slate-950 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.6)] active:scale-95 disabled:opacity-50"
              >
                {loading === "email" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Sign in with Magic Link
                    <ArrowRight className="h-5 w-5 transition-transform group-hover/magic:translate-x-1.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Advanced Footer */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-sm font-medium text-slate-500">
            Trusted by the world's most innovative designers.
          </p>
          <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Simple placeholders for "trust logos" if needed */}
             <div className="h-6 w-20 bg-slate-400 rounded-lg" />
             <div className="h-6 w-20 bg-slate-400 rounded-lg" />
             <div className="h-6 w-20 bg-slate-400 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
