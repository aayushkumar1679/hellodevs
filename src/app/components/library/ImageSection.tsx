"use client";

import React from "react";

type ImageSectionProps = {
  title?: string;
  images?: string[];
  columns?: number;
};

export const ImageSection = ({
  title = "Gallery",
  images = [
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
  ],
  columns = 3,
}: ImageSectionProps) => {
  return (
    <section className="w-full py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {images.map((img, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg">
              <img
                src={img}
                alt={`Gallery ${idx}`}
                className="w-full h-64 object-cover hover:scale-105 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
