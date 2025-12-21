"use client";

import React from "react";
import { useDesignStore } from "@/state/useDesignStore";

type ContextMenuProps = {
  x: number;
  y: number;
  elementId: string;
  onClose: () => void;
};

export default function ContextMenu({
  x,
  y,
  elementId,
  onClose,
}: ContextMenuProps) {
  const { removeElement, selectedElements } = useDesignStore();

  const menuItems = [
    {
      label: "Copy",
      icon: "📋",
      onClick: () => onClose(),
    },
    {
      label: "Paste",
      icon: "📌",
      onClick: () => onClose(),
    },
    {
      label: "Delete",
      icon: "🗑️",
      onClick: () => {
        removeElement(elementId);
        onClose();
      },
    },
    {
      label: "Group",
      icon: "📦",
      onClick: () => onClose(),
      disabled: selectedElements.length < 2,
    },
  ];

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1"
      style={{ top: `${y}px`, left: `${x}px` }}
      onClick={onClose}
    >
      {menuItems.map((item, idx) => (
        <button
          key={idx}
          onClick={item.onClick}
          disabled={item.disabled}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
