import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Box, Code2 } from "lucide-react";
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
  };

  return (
    <div
      className="min-h-screen text-white selection:bg-violet-500/25"
      style={{ background: "#070709" }}
    >
      {/* ── Ambient background ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-700/8 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 h-[500px] w-[500px] rounded-full bg-indigo-700/6 blur-[100px]" />
        <div className="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-violet-900/6 blur-[80px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,#070709_100%)]" />
      </div>

      {/* ── Top nav ────────────────────────────────────────── */}
      <header className="relative z-40 flex h-12 items-center border-b border-white/[0.06] bg-[#070709]/80 px-6 backdrop-blur-xl">
        <div className="flex w-full max-w-7xl mx-auto items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_16px_rgba(124,110,248,0.5)]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30">
                Polyglot
              </span>
              <p className="text-[11px] font-bold leading-none text-white/60">
                AI Studio
              </p>
            </div>
          </div>
          <DashboardHeader />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* ── Hero row ───────────────────────────────────────── */}
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Left hero card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0E0E12] p-8">
            {/* Corner glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/10 blur-[60px]" />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">
                <Sparkles className="h-2.5 w-2.5" />
                Prompt-First AI Builder
              </span>

              <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-[-0.03em] text-white xl:text-5xl">
                Build any website
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  from one sentence.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-[13px] leading-6 text-white/40">
                Describe your idea → Polyglot generates a pixel-perfect,
                animated, image-rich website → edit it visually → export
                production code.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/builder/new"
                  className="group/btn inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(124,110,248,0.35)] transition-all hover:bg-violet-500 hover:shadow-[0_6px_28px_rgba(124,110,248,0.5)] active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Launch AI Studio
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-[13px] font-semibold text-white/50 transition hover:border-white/15 hover:text-white/70"
                >
                  View projects
                </a>
              </div>

              {/* Mini stats row */}
              <div className="mt-8 flex items-center gap-6 border-t border-white/[0.06] pt-6">
                {[
                  { label: "Projects", value: stats.projects },
                  { label: "Components", value: stats.layers },
                  { label: "Export ready", value: "100%" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                      {label}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right feature cards */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: Sparkles,
                title: "AI Generation",
                body: "Multi-step pipeline: brand analysis → layout → real AI images → animations. All from one prompt.",
                accent: "violet",
              },
              {
                icon: Box,
                title: "Visual Canvas",
                body: "Drag, drop, resize, restyle. Figma-quality editing with a live component tree and CSS inspector.",
                accent: "sky",
              },
              {
                icon: Code2,
                title: "Production Export",
                body: "Download a clean Next.js + Tailwind project. All animations, fonts, and design tokens included.",
                accent: "emerald",
              },
            ].map(({ icon: Icon, title, body, accent }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0E0E12] px-5 py-4 transition-all hover:border-white/10 hover:bg-[#13131A]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      accent === "violet"
                        ? "bg-violet-500/12 text-violet-400"
                        : accent === "sky"
                          ? "bg-sky-500/12 text-sky-400"
                          : "bg-emerald-500/12 text-emerald-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white/80">
                      {title}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-white/35">
                      {body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects section ───────────────────────────────── */}
        <section id="projects">
          {session ? (
            <DashboardClient initialProjects={initialProjects} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0E0E12] py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-white/70">
                Sign in to access your projects
              </h3>
              <p className="mt-2 text-[12px] text-white/30">
                Create and manage your AI-generated websites from one place.
              </p>
              <Link
                href="/auth/signin"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-violet-500"
              >
                Sign in <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
