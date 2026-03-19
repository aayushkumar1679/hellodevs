import { create } from "zustand";

/* ---------------- Types ---------------- */

export type Breakpoint = "mobile" | "tablet" | "desktop";
export type ViewMode = "design" | "code" | "split" | "preview" | "diff";

interface BreakpointConfig {
  width: number;
  label: string;
}

interface EditorState {
  /* Active view mode */
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  /* Active breakpoint */
  activeBreakpoint: Breakpoint;

  /* Preview / canvas frame */
  previewEnabled: boolean;
  threeEnabled: boolean;
  threeSpeed: number;
  threeDensity: number;

  /* Selection State */
  selectedElements: string[];
  selectElement: (id: string, multiSelect?: boolean) => void;
  deselectAll: () => void;

  /* Drag and Drop State */
  draggedId: string | null;
  setDraggedId: (id: string | null) => void;

  /* Breakpoint configs */
  breakpoints: Record<Breakpoint, BreakpointConfig>;

  /* Actions */
  setBreakpoint: (bp: Breakpoint) => void;
  togglePreview: () => void;
  toggleThree: () => void;
  setThreeSpeed: (value: number) => void;
  setThreeDensity: (value: number) => void;
}

/* ---------------- Store ---------------- */

export const useEditorStore = create<EditorState>((set) => ({
  /* Default state */
  viewMode: "split",
  activeBreakpoint: "desktop",
  previewEnabled: true,
  threeEnabled: true,
  threeSpeed: 1,
  threeDensity: 1,
  selectedElements: [],
  draggedId: null,

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
  setViewMode: (mode) => set({ viewMode: mode }),

  setBreakpoint: (bp) =>
    set(() => ({
      activeBreakpoint: bp,
    })),

  togglePreview: () =>
    set((state) => ({
      previewEnabled: !state.previewEnabled,
    })),

  toggleThree: () =>
    set((state) => ({
      threeEnabled: !state.threeEnabled,
    })),

  setThreeSpeed: (value) =>
    set(() => ({
      threeSpeed: Math.min(2.5, Math.max(0.2, value)),
    })),

  setThreeDensity: (value) =>
    set(() => ({
      threeDensity: Math.min(2.5, Math.max(0.4, value)),
    })),

  selectElement: (id, multiSelect = false) =>
    set((state) => ({
      selectedElements: multiSelect
        ? state.selectedElements.includes(id)
          ? state.selectedElements.filter((sid) => sid !== id)
          : [...state.selectedElements, id]
        : [id],
    })),

  deselectAll: () => set({ selectedElements: [] }),

  setDraggedId: (id) => set({ draggedId: id }),
}));
