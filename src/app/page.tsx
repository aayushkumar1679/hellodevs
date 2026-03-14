import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DashboardClient from "./components/dashboard/DashboardClient";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  const dbProjects = session?.user?.id
    ? await prisma.project.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const initialProjects = dbProjects.map((p) => {
    const components = (p.components as Record<string, unknown>) || {};
    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      components,
      designElements: (p.designElements as Record<string, unknown>) || {},
      componentCount: Object.keys(components).length,
    };
  });

  const stats = {
    projects: initialProjects.length,
    layers: initialProjects.reduce((sum, p) => sum + p.componentCount, 0),
    lastUpdated: initialProjects[0]?.updatedAt || new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_35%,#f8fafc_100%)] text-slate-950 selection:bg-sky-100 selection:text-sky-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-slate-950 text-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.8)] transition-transform group-hover:scale-105 group-hover:rotate-6">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Polyglot
              </p>
              <h1 className="text-sm font-bold text-slate-950">
                World-Class AI Studio
              </h1>
            </div>
          </div>

          <DashboardHeader />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-8 py-14">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative group overflow-hidden rounded-[48px] border border-slate-200 bg-white/70 p-10 shadow-[0_50px_100px_-50px_rgba(15,23,42,0.5)] backdrop-blur-2xl transition-all hover:shadow-[0_60px_120px_-50px_rgba(15,23,42,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.06),transparent_40%)]" />
            <p className="relative inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700">
              <Sparkles className="h-4 w-4" />
              Next-Gen Design Studio
            </p>
            <h2 className="relative mt-8 max-w-3xl text-6xl font-black leading-[1.1] tracking-tighter text-slate-950 lg:text-7xl">
              Design like a pro, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">at AI speed.</span>
            </h2>
            <p className="relative mt-8 max-w-2xl text-lg leading-9 text-slate-600 font-medium">
              Combine OpenAI-assisted generations, a high-fidelity visual canvas,
              and direct production exports into a single deterministic workflow.
            </p>

            <div className="relative mt-10 flex flex-wrap gap-4">
              <Link
                href="/builder/new"
                className="group/btn inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-[15px] font-bold text-white shadow-[0_25px_50px_-15px_rgba(15,23,42,0.6)] transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
              >
                Launch Studio
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover/btn:translate-x-1" />
              </Link>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-[15px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md active:scale-95"
              >
                Recent Works
              </a>
            </div>

            <div className="relative mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[32px] border border-slate-100 bg-slate-50/70 p-5 shadow-inner transition-transform hover:scale-[1.02]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Projects
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-4xl font-black text-slate-950 tracking-tighter">
                    {stats.projects}
                  </p>
                  <p className="text-xs font-bold text-slate-400">active</p>
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-100 bg-slate-50/70 p-5 shadow-inner transition-transform hover:scale-[1.02]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Layers
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-4xl font-black text-slate-950 tracking-tighter">
                    {stats.layers}
                  </p>
                  <p className="text-xs font-bold text-slate-400">synced</p>
                </div>
              </div>
              <div className="rounded-[32px] border border-slate-100 bg-slate-50/70 p-5 shadow-inner transition-transform hover:scale-[1.02]">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Reliability
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <p className="text-3xl font-black text-slate-950 tracking-tighter">
                    100%
                  </p>
                  <p className="text-xs font-bold text-slate-400">export</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[48px] border border-slate-200 bg-[radial-gradient(circle_at_top,#fff7ed,transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-10 shadow-[0_50px_100px_-50px_rgba(15,23,42,0.4)] transition-all hover:shadow-[0_60px_120px_-50px_rgba(15,23,42,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_40%)]" />
            <div className="relative flex flex-col h-full">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Platform Values
              </p>
              <div className="mt-8 flex-1 grid grid-rows-3 gap-5">
                {[
                  { title: "Deterministic Generations", text: "Structured landing sections instantly." },
                  { title: "High-Fidelity UI", text: "Premium depth with simple graphical layers." },
                  { title: "Code Production", text: "Directly export Next.js 14 applications." }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group border border-white/80 bg-white/95 p-6 rounded-[28px] shadow-sm hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-center"
                  >
                    <p className="text-base font-black text-slate-950 tracking-tight">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {session ? (
          <DashboardClient initialProjects={initialProjects} />
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-black text-slate-950">Log in to view your projects</h3>
            <p className="mt-3 text-slate-500">You must be logged in to create and manage web projects.</p>
            <Link href="/auth/signin" className="inline-block mt-6 px-8 py-4 bg-slate-950 text-white rounded-full font-bold shadow-lg shadow-slate-950/20">
              Sign In
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
