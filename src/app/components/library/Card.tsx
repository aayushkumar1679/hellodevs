"use client";

import React from "react";
import NextImage from "next/image";

type CardProps = {
  title?: string;
  description?: string;
  image?: string;
  badge?: string;
};

export const Card = ({
  title = "Card Title",
  description = "This is a card description",
  image,
  badge,
}: CardProps) => {
  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition">
      {image && (
        <div className="relative w-full h-48">
          <NextImage 
            src={image} 
            alt={title} 
            fill 
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        {badge && (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mb-2">
            {badge}
          </span>
        )}
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};
