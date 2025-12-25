import { create } from "zustand";

/* ---------------- Types ---------------- */

export type Breakpoint = "mobile" | "tablet" | "desktop";

interface BreakpointConfig {
  width: number;
  label: string;
}

interface EditorState {
  /* Active breakpoint */
  activeBreakpoint: Breakpoint;

  /* Preview / canvas frame */
  previewEnabled: boolean;

  /* Breakpoint configs */
  breakpoints: Record<Breakpoint, BreakpointConfig>;

  /* Actions */
  setBreakpoint: (bp: Breakpoint) => void;
  togglePreview: () => void;
}

/* ---------------- Store ---------------- */

export const useEditorStore = create<EditorState>((set) => ({
  /* Default state */
  activeBreakpoint: "desktop",
  previewEnabled: true,

  breakpoints: {
    mobile: {
      width: 375,
      label: "Mobile (375px)",
    },
    tablet: {
      width: 768,
      label: "Tablet (768px)",
    },
    desktop: {
      width: 1440,
      label: "Desktop (1440px)",
    },
  },

  /* Actions */
  setBreakpoint: (bp) =>
    set(() => ({
      activeBreakpoint: bp,
    })),

  togglePreview: () =>
    set((state) => ({
      previewEnabled: !state.previewEnabled,
    })),
}));
