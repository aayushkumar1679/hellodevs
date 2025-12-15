"use client";

import React from "react";

type FeaturesProps = {
  title?: string;
  columns?: number;
  features?: Array<{ title: string; description: string }>;
};

export const Features = ({
  title = "Features",
  columns = 3,
  features = [
    { title: "Fast", description: "Optimized for speed" },
    { title: "Secure", description: "Enterprise-grade security" },
    { title: "Scalable", description: "Grows with your needs" },
  ],
}: FeaturesProps) => {
  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 border rounded-lg hover:shadow-lg transition"
            >
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
