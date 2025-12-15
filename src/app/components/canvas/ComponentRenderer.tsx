"use client";

import React from "react";
import {
  Navbar,
  Hero,
  Features,
  Pricing,
  CTA,
  Footer,
  Card,
  Button,
  Form,
  ImageSection,
} from "@/app/components/library";

const componentMap: Record<string, React.ComponentType<any>> = {
  Navbar,
  Hero,
  Features,
  Pricing,
  CTA,
  Footer,
  Card,
  Button,
  Form,
  ImageSection,
};

type ComponentRendererProps = {
  component: any;
};

export default function ComponentRenderer({
  component,
}: ComponentRendererProps) {
  try {
    const Component = componentMap[component.type];

    if (!Component) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          ❌ Unknown component type: {component.type}
        </div>
      );
    }

    return (
      <React.Suspense
        fallback={<div className="p-4 text-gray-400">Loading...</div>}
      >
        <Component {...(component.props || {})} />
      </React.Suspense>
    );
  } catch (error) {
    console.error("Error rendering component:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        ❌ Error rendering {component.type}: {String(error).slice(0, 50)}
      </div>
    );
  }
}
