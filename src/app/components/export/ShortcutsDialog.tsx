"use client";

import React from "react";
import {
  KEYBOARD_SHORTCUTS,
  getShortcutDisplay,
} from "@/utils/keyboardShortcuts";

type ShortcutsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  page?: "builder" | "home" | "preview" | "share";
};

export default function ShortcutsDialog({
  isOpen,
  onClose,
  page = "builder",
}: ShortcutsDialogProps) {
  if (!isOpen) return null;

  let shortcuts: Record<string, any> = {};

  switch (page) {
    case "builder":
      shortcuts = KEYBOARD_SHORTCUTS.builder;
      break;
    case "home":
      shortcuts = {
        ...KEYBOARD_SHORTCUTS.home,
        ...KEYBOARD_SHORTCUTS.global,
      };
      break;
    case "preview":
      shortcuts = {
        ...KEYBOARD_SHORTCUTS.preview,
        ...KEYBOARD_SHORTCUTS.global,
      };
      break;
    case "share":
      shortcuts = {
        ...KEYBOARD_SHORTCUTS.share,
        ...KEYBOARD_SHORTCUTS.global,
      };
      break;
    default:
      shortcuts = KEYBOARD_SHORTCUTS.global;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ⌨️ Keyboard Shortcuts
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Master shortcuts for faster editing
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(shortcuts).map(
              ([action, shortcut]: [string, any]) => (
                <div
                  key={action}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition group"
                >
                  <div className="text-2xl">{shortcut.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {action.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {shortcut.action}
                    </div>
                  </div>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-semibold text-gray-700 whitespace-nowrap group-hover:border-blue-300 group-hover:bg-blue-50 transition">
                    {getShortcutDisplay(shortcut.keys)}
                  </kbd>
                </div>
              )
            )}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-bold text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Press{" "}
                <kbd className="px-1 bg-white border border-blue-300 rounded text-xs">
                  Ctrl+?
                </kbd>{" "}
                anytime to see shortcuts
              </li>
              <li>
                • Click any element to select it, then edit CSS properties
              </li>
              <li>• Shift+Click to select multiple elements</li>
              <li>• Right-click for context menu options</li>
              <li>• Drag elements to reorder them on the canvas</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Got it! (Press Escape)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-100 transition"
          >
            Esc
          </button>
        </div>
      </div>
    </div>
  );
}
