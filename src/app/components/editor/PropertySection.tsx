"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface PropertySectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function PropertySection({
  title,
  children,
  isExpanded,
  onToggle,
}: PropertySectionProps) {
  return (
    <div className="bg-gray-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-700 transition-colors group"
      >
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          {title}
        </span>
        {isExpanded ? (
          <ChevronDown
            size={16}
            className="text-gray-400 group-hover:text-gray-200"
          />
        ) : (
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-gray-200"
          />
        )}
      </button>
      {isExpanded && (
        <div className="px-3 py-2 bg-gray-750 space-y-2">{children}</div>
      )}
    </div>
  );
}
