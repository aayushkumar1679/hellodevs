"use client";

import React from "react";

type CTAProps = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonSecondary?: string;
};

export const CTA = ({
  title = "Ready to get started?",
  subtitle = "Join thousands of developers building amazing websites",
  buttonText = "Start Free",
  buttonSecondary = "Learn More",
}: CTAProps) => {
  return (
    <section className="w-full py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg mb-8 opacity-90">{subtitle}</p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded hover:bg-gray-100 transition">
            {buttonText}
          </button>
          <button className="px-8 py-3 border-2 border-white font-bold rounded hover:bg-white hover:text-blue-600 transition">
            {buttonSecondary}
          </button>
        </div>
      </div>
    </section>
  );
};
