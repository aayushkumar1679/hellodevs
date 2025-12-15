"use client";

import React from "react";

type ShortcutsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ShortcutsDialog({
  isOpen,
  onClose,
}: ShortcutsDialogProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Ctrl + Z", action: "Undo" },
    { key: "Ctrl + Y", action: "Redo" },
    { key: "Esc", action: "Deselect component" },
    { key: "Delete", action: "Delete selected component" },
    { key: "Ctrl + D", action: "Duplicate component" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono font-medium">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
