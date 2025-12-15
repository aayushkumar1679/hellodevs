"use client";

import React from "react";

type FooterProps = {
  copyright?: string;
  links?: string[];
  columns?: number;
};

export const Footer = ({
  copyright = "© 2025 Your Company. All rights reserved.",
  links = ["Privacy", "Terms", "Contact", "Blog"],
}: FooterProps) => {
  return (
    <footer className="w-full bg-slate-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="font-bold text-lg">Your Brand</div>
          <div className="flex gap-6">
            {links.map((link) => (
              <a key={link} href="#" className="hover:text-blue-400 transition">
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          {copyright}
        </div>
      </div>
    </footer>
  );
};
