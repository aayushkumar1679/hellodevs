export const KEYBOARD_SHORTCUTS = {
  builder: {
    undo: {
      keys: ["Control", "z"],
      action: "Undo last action",
      icon: "↶",
    },
    redo: {
      keys: ["Control", "y"],
      action: "Redo last action",
      icon: "↷",
    },
    duplicate: {
      keys: ["Control", "d"],
      action: "Duplicate component",
      icon: "📋",
    },
    delete: {
      keys: ["Delete"],
      action: "Delete selected component",
      icon: "🗑️",
    },
    deselect: {
      keys: ["Escape"],
      action: "Deselect component",
      icon: "◀",
    },
    help: {
      keys: ["Control", "?"],
      action: "Show keyboard shortcuts",
      icon: "⌨️",
    },
  },
  home: {
    new: {
      keys: ["Control", "n"],
      action: "Create new project",
      icon: "✨",
    },
    help: {
      keys: ["Control", "?"],
      action: "Show keyboard shortcuts",
      icon: "⌨️",
    },
  },
  preview: {
    editor: {
      keys: ["Control", "e"],
      action: "Go back to editor",
      icon: "✏️",
    },
    help: {
      keys: ["Control", "?"],
      action: "Show keyboard shortcuts",
      icon: "⌨️",
    },
  },
  share: {
    code: {
      keys: ["Control", "k"],
      action: "Toggle code view",
      icon: "💻",
    },
    help: {
      keys: ["Control", "?"],
      action: "Show keyboard shortcuts",
      icon: "⌨️",
    },
  },
  global: {
    help: {
      keys: ["Control", "?"],
      action: "Show keyboard shortcuts",
      icon: "⌨️",
    },
  },
};

export function matchesShortcut(
  event: KeyboardEvent,
  shortcutKeys: string[]
): boolean {
  const eventKeys: string[] = [];

  if (event.ctrlKey || event.metaKey)
    eventKeys.push(event.ctrlKey ? "Control" : "meta");
  if (event.shiftKey) eventKeys.push("Shift");
  if (event.altKey) eventKeys.push("Alt");

  const keyPressed = event.key.toLowerCase();
  eventKeys.push(keyPressed);

  // Normalize shortcut keys
  const normalizedShortcut = shortcutKeys.map((k) => k.toLowerCase());

  // Check if all shortcut keys match event keys
  return normalizedShortcut.every((key) =>
    eventKeys.some((ek) => ek.toLowerCase() === key)
  );
}

export function getShortcutDisplay(keys: string[]): string {
  return keys
    .map((k) => {
      const lower = k.toLowerCase();
      switch (lower) {
        case "control":
          return "Ctrl";
        case "meta":
          return "⌘";
        case "shift":
          return "⇧";
        case "alt":
          return "⌥";
        case "delete":
          return "Del";
        case "escape":
          return "Esc";
        case "?":
          return "?";
        default:
          return k.length === 1 ? k.toUpperCase() : k;
      }
    })
    .join(" + ");
}
