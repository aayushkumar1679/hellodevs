// src/app/sample/SampleLandingPage.tsx
"use client";

import React from "react";
import NextImage from "next/image";

export default function SampleLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a className="text-xl font-semibold text-sky-700">Tetrons</a>
            <nav className="hidden md:flex gap-6 items-center text-sm text-slate-600">
              <a className="hover:text-slate-900">Product</a>
              <a className="hover:text-slate-900">Pricing</a>
              <a className="hover:text-slate-900">Docs</a>
              <a className="inline-flex items-center px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700">
                Get started
              </a>
            </nav>
            <div className="md:hidden">
              <button className="p-2 rounded-md border">Menu</button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="py-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-4 sm:px-6 lg:px-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                Build better, ship faster.
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-xl">
                A modern content-first editor for teams. Type, speak, and ship —
                all inside one fast editor.
              </p>

              <div className="mt-6 flex gap-3">
                <a className="inline-flex items-center px-5 py-3 rounded-lg bg-sky-600 text-white font-medium shadow hover:bg-sky-700">
                  Get started free
                </a>
                <a className="inline-flex items-center px-4 py-3 rounded-lg border text-slate-700 hover:bg-slate-50">
                  View demo
                </a>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-slate-500">
                <div>Trusted by teams</div>
                <div>Production ready</div>
                <div>Accessible</div>
              </div>
            </div>

            <div>
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="relative w-full h-64 overflow-hidden rounded-md">
                  <NextImage
                    src="https://images.pexels.com/photos/270360/pexels-photo-270360.jpeg"
                    alt="hero"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  Live editor demo — compose content, layouts and components in
                  one place.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold">Core features</h2>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Everything you need to design and ship content fast.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-2">WYSIWYG editor</h3>
                <p className="text-sm text-slate-600">
                  Real-time editing with keyboard + voice support.
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-2">Components</h3>
                <p className="text-sm text-slate-600">
                  Reusable components & templates for production pages.
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-2">Export & Integrations</h3>
                <p className="text-sm text-slate-600">
                  Export clean HTML/CSS or integrate with your stack.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="p-8 bg-sky-600 text-white rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold">Ready to try it out?</h3>
              <p className="mt-2 text-sky-100">
                Start a free trial and build your first landing page in minutes.
              </p>
              <div className="mt-4">
                <a className="inline-flex items-center px-6 py-3 bg-white text-sky-700 rounded-md font-semibold">
                  Start free
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-400 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-white font-semibold">Tetrons</div>
              <p className="text-sm mt-2">
                A small product studio for great editors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium">Product</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li>Features</li>
                <li>Pricing</li>
                <li>Docs</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium">Company</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
