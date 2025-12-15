import { CanvasComponent } from "@/state/useCanvasStore";

const COMPONENT_IMPORTS: Record<string, string> = {
  Navbar: 'import Navbar from "@/components/Navbar";',
  Hero: 'import Hero from "@/components/Hero";',
  Features: 'import Features from "@/components/Features";',
  Pricing: 'import Pricing from "@/components/Pricing";',
  CTA: 'import CTA from "@/components/CTA";',
  Footer: 'import Footer from "@/components/Footer";',
  Card: 'import Card from "@/components/Card";',
  Button: 'import Button from "@/components/Button";',
  Form: 'import Form from "@/components/Form";',
  ImageSection: 'import ImageSection from "@/components/ImageSection";',
};

export function generateReactCode(components: CanvasComponent[]): string {
  const imports = new Set<string>();

  components.forEach((comp) => {
    if (COMPONENT_IMPORTS[comp.type]) {
      imports.add(COMPONENT_IMPORTS[comp.type]);
    }
  });

  const componentCalls = components
    .map((comp) => {
      const props = comp.props || {};
      const propsArray: string[] = [];

      Object.entries(props).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (typeof value === "string") {
          propsArray.push(`${key}="${value}"`);
        } else if (typeof value === "number") {
          propsArray.push(`${key}={${value}}`);
        } else if (typeof value === "boolean") {
          propsArray.push(`${key}={${value}}`);
        } else {
          propsArray.push(`${key}={${JSON.stringify(value)}}`);
        }
      });

      const propsString = propsArray.join(" ");
      return `<${comp.type} ${propsString} />`;
    })
    .join("\n    ");

  return `"use client";

import React from "react";
${Array.from(imports).join("\n")}

export default function Page() {
  return (
    <main className="w-full">
      ${componentCalls}
    </main>
  );
}`;
}

export function generateHTMLCode(components: CanvasComponent[]): string {
  const getComponentHTML = (comp: CanvasComponent): string => {
    const props = comp.props || {};

    switch (comp.type) {
      case "Navbar": {
        const logo = props.logo || "Logo";
        const navItems = props.navItems || [
          "Home",
          "About",
          "Services",
          "Contact",
        ];
        return `<nav class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <div class="font-bold text-xl">${logo}</div>
        <div class="flex gap-8">
          ${navItems
            .map(
              (item: string) =>
                `<a href="#" class="hover:opacity-60">${item}</a>`
            )
            .join("\n          ")}
        </div>
      </div>
    </nav>`;
      }

      case "Hero": {
        const title = props.title || "Welcome";
        const subtitle = props.subtitle || "Subtitle";
        const buttonText = props.buttonText || "Get Started";
        return `<section class="w-full py-20 px-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl font-bold mb-4">${title}</h1>
        <p class="text-xl text-gray-300 mb-8">${subtitle}</p>
        <button class="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">${buttonText}</button>
      </div>
    </section>`;
      }

      case "Features": {
        const title = props.title || "Features";
        const features = props.features || [
          { title: "Feature 1", description: "Description" },
          { title: "Feature 2", description: "Description" },
          { title: "Feature 3", description: "Description" },
        ];
        return `<section class="w-full py-16 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12">${title}</h2>
        <div class="grid grid-cols-3 gap-8">
          ${features
            .map(
              (f: any) => `<div class="p-6 border rounded-lg">
            <h3 class="font-bold text-xl mb-2">${f.title}</h3>
            <p class="text-gray-600">${f.description}</p>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;
      }

      case "Pricing": {
        const title = props.title || "Pricing";
        const tiers = props.tiers || [
          { name: "Starter", price: 29 },
          { name: "Pro", price: 79 },
          { name: "Enterprise", price: 299 },
        ];
        return `<section class="w-full py-16 px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12">${title}</h2>
        <div class="grid grid-cols-3 gap-8">
          ${tiers
            .map(
              (tier: any) => `<div class="bg-white p-8 rounded-lg border">
            <h3 class="text-2xl font-bold mb-2">${tier.name}</h3>
            <div class="text-3xl font-bold mb-6">$${tier.price}/mo</div>
            <button class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Choose Plan</button>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;
      }

      case "CTA": {
        const title = props.title || "Ready to start?";
        const subtitle = props.subtitle || "Get started today";
        const buttonText = props.buttonText || "Get Started";
        return `<section class="w-full py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-4">${title}</h2>
        <p class="text-lg mb-8">${subtitle}</p>
        <button class="px-8 py-3 bg-white text-blue-600 font-bold rounded hover:bg-gray-100">${buttonText}</button>
      </div>
    </section>`;
      }

      case "Footer": {
        const copyright = props.copyright || "© 2025 Your Company";
        const links = props.links || ["Privacy", "Terms", "Contact"];
        return `<footer class="w-full bg-slate-900 text-white py-12 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div class="font-bold text-lg">Your Brand</div>
          <div class="flex gap-6">
            ${links
              .map(
                (link: string) =>
                  `<a href="#" class="hover:text-blue-400">${link}</a>`
              )
              .join("\n            ")}
          </div>
        </div>
        <div class="border-t border-gray-700 pt-8 text-center text-gray-400">${copyright}</div>
      </div>
    </footer>`;
      }

      case "Card": {
        const title = props.title || "Card Title";
        const description = props.description || "Description";
        const badge = props.badge || "";
        return `<div class="bg-white border rounded-lg overflow-hidden hover:shadow-lg p-4">
      ${
        badge
          ? `<span class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mb-2">${badge}</span>`
          : ""
      }
      <h3 class="font-bold text-lg mb-2">${title}</h3>
      <p class="text-gray-600">${description}</p>
    </div>`;
      }

      case "Button": {
        const text = props.text || "Button";
        const variant = props.variant || "primary";
        const variantClass =
          variant === "primary"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : variant === "secondary"
            ? "bg-gray-200 text-black hover:bg-gray-300"
            : "border-2 border-blue-600 text-blue-600 hover:bg-blue-50";
        return `<button class="px-4 py-2 font-semibold rounded ${variantClass}">${text}</button>`;
      }

      case "Form": {
        const title = props.title || "Contact Us";
        const fields = props.fields || ["Name", "Email", "Message"];
        return `<section class="w-full py-12 px-6 bg-white">
      <div class="max-w-md mx-auto">
        <h2 class="text-3xl font-bold mb-6">${title}</h2>
        <form class="space-y-4">
          ${fields
            .map(
              (field: string) => `<div>
            <label class="block text-sm font-medium mb-1">${field}</label>
            <input type="${
              field.toLowerCase() === "email" ? "email" : "text"
            }" placeholder="${field}" class="w-full border rounded px-3 py-2" />
          </div>`
            )
            .join("\n          ")}
          <button type="submit" class="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Submit</button>
        </form>
      </div>
    </section>`;
      }

      case "ImageSection": {
        const title = props.title || "Gallery";
        const images = props.images || [
          "https://via.placeholder.com/400x300?text=Image+1",
          "https://via.placeholder.com/400x300?text=Image+2",
          "https://via.placeholder.com/400x300?text=Image+3",
        ];
        return `<section class="w-full py-12 px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-8">${title}</h2>
        <div class="grid grid-cols-3 gap-4">
          ${images
            .map(
              (
                img: string,
                idx: number
              ) => `<div class="overflow-hidden rounded-lg">
            <img src="${img}" alt="Image ${
                idx + 1
              }" class="w-full h-64 object-cover hover:scale-105 transition" />
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;
      }

      default:
        return "";
    }
  };

  const html = components.map((comp) => getComponentHTML(comp)).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    </style>
</head>
<body>
    <main class="w-full">
        ${html}
    </main>
</body>
</html>`;
}

export function downloadCode(code: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(code)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
