"use client";

import React from "react";
import {  CanvasComponent  } from "@/state/useProjectStore";
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

type CanvasPreviewProps = {
  components: CanvasComponent[];
};

export default function CanvasPreview({ components }: CanvasPreviewProps) {
  return (
    <div className="w-full bg-white">
      {components.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
          <p>No components to preview</p>
        </div>
      ) : (
        <div>
          {components.map((component) => {
            const Component = componentMap[component.type];

            if (!Component) {
              return (
                <div
                  key={component.id}
                  className="p-4 bg-red-50 border border-red-200 m-4 rounded text-red-700"
                >
                  Unknown component: {component.type}
                </div>
              );
            }

            return (
              <div key={component.id}>
                <Component {...(component.props || {})} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
