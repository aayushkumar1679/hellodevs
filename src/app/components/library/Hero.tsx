"use client";

import React from "react";

type HeroProps = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  backgroundImage?: string;
};

export const Hero = ({
  title = "Welcome to Our Platform",
  subtitle = "Build amazing websites visually with code control",
  buttonText = "Get Started",
  backgroundImage,
}: HeroProps) => {
  return (
    <section
      className="relative w-full py-20 px-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white"
      style={
        backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}
      }
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4 leading-tight">{title}</h1>
        <p className="text-xl text-gray-300 mb-8">{subtitle}</p>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
          {buttonText}
        </button>
      </div>
    </section>
  );
};
