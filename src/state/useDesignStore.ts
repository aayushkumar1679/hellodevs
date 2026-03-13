import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createElementRecord } from "@/utils/projectModel";
import { useCanvasStore } from "./useCanvasStore";
import debounce from "lodash.debounce";

/* ---------------------------------------------
 Types
---------------------------------------------- */

export type Breakpoint = "desktop" | "tablet" | "mobile";
export type CSSProperties = Record<string, unknown>;

export interface ResponsiveCss {
  [key: string]: CSSProperties | undefined;
  base: CSSProperties;
  tablet?: CSSProperties;
  mobile?: CSSProperties;
}

export interface Element {
  id: string;
  type: string;
  cssProperties: ResponsiveCss;
  children?: string[];
  parentId?: string | null;
}

interface DesignState {
  elements: Record<string, Element>;
  selectedElements: string[];
  activeBreakpoint: Breakpoint;

  /* element actions */
  addElement: (
    id: string,
    type: string,
    initialCss?: Record<string, unknown>
  ) => void;
  replaceElements: (elements: Record<string, Element>) => void;

  selectElement: (id: string, multiSelect?: boolean) => void;
  deselectAll: () => void;
  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;

  /* breakpoint */
  setActiveBreakpoint: (bp: Breakpoint) => void;

  /* css updates */
  updateCSSProperty: (
    elementId: string,
    property: string,
    value: unknown
  ) => void;

  updateCSSPropertiesBulk: (
    elementIds: string[],
    property: string,
    value: unknown
  ) => void;

  /* resolver */
  getResolvedCss: (elementId: string) => Record<string, unknown>;
}

/* ---------------------------------------------
 Store
---------------------------------------------- */

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      elements: {},
      selectedElements: [],
      activeBreakpoint: "desktop",

      /* -----------------------------------------
         Element creation
      ------------------------------------------ */

      addElement: (id, type, initialCss = {}) =>
        set((state) => {
          if (state.elements[id]) {
            return state;
          }

          return {
            elements: {
              ...state.elements,
              [id]: createElementRecord(id, type, initialCss),
            },
          };
        }),

      replaceElements: (elements) =>
        set((state) => ({
          elements,
          selectedElements: state.selectedElements.filter((id) => elements[id]),
        })),

      /* -----------------------------------------
         Selection
      ------------------------------------------ */

      selectElement: (id, multiSelect = false) =>
        set((state) => ({
          selectedElements: multiSelect
            ? state.selectedElements.includes(id)
              ? state.selectedElements.filter((sid) => sid !== id)
              : [...state.selectedElements, id]
            : [id],
        })),

      deselectAll: () => set({ selectedElements: [] }),

      removeElement: (id) =>
        set((state) => {
          const rest = { ...state.elements };
          delete rest[id];
          return {
            elements: rest,
            selectedElements: state.selectedElements.filter((sid) => sid !== id),
          };
        }),

      removeElements: (ids) =>
        set((state) => {
          if (ids.length === 0) return state;

          const nextElements = { ...state.elements };
          ids.forEach((id) => {
            delete nextElements[id];
          });

          return {
            elements: nextElements,
            selectedElements: state.selectedElements.filter(
              (sid) => !ids.includes(sid)
            ),
          };
        }),

      updateElement: (id, updates) =>
        set((state) => {
          const current = state.elements[id];
          if (!current) return state;

          return {
            elements: {
              ...state.elements,
              [id]: {
                ...current,
                ...updates,
              },
            },
          };
        }),

      /* -----------------------------------------
         Breakpoint
      ------------------------------------------ */

      setActiveBreakpoint: (bp) => set({ activeBreakpoint: bp }),

      /* -----------------------------------------
         CSS updates (SAFE)
      ------------------------------------------ */

      updateCSSProperty: (elementId, property, value) =>
        set((state) => {
          const el = state.elements[elementId];
          if (!el) return state;

          const bp = state.activeBreakpoint;
          const nextCss = { ...el.cssProperties };

          if (bp === "desktop") {
            nextCss.base = { ...nextCss.base, [property]: value };
          } else {
            nextCss[bp] = {
              ...(nextCss[bp] || {}),
              [property]: value,
            };
          }

          return {
            elements: {
              ...state.elements,
              [elementId]: {
                ...el,
                cssProperties: nextCss,
              },
            },
          };
        }),

      updateCSSPropertiesBulk: (elementIds, property, value) =>
        set((state) => {
          const updated = { ...state.elements };
          const bp = state.activeBreakpoint;

          elementIds.forEach((id) => {
            const el = updated[id];
            if (!el) return;

            const nextCss = { ...el.cssProperties };

            if (bp === "desktop") {
              nextCss.base = {
                ...nextCss.base,
                [property]: value,
              };
            } else {
              nextCss[bp] = {
                ...(nextCss[bp] || {}),
                [property]: value,
              };
            }

            updated[id] = {
              ...el,
              cssProperties: nextCss,
            };
          });

          return { elements: updated };
        }),

      /* -----------------------------------------
         FINAL RESOLVER
      ------------------------------------------ */

      getResolvedCss: (elementId) => {
        const el = get().elements[elementId];
        if (!el) return {};

        const { base, tablet, mobile } = el.cssProperties;
        const bp = get().activeBreakpoint;

        if (bp === "mobile") {
          return { ...base, ...(tablet || {}), ...(mobile || {}) };
        }

        if (bp === "tablet") {
          return { ...base, ...(tablet || {}) };
        }

        return { ...base };
      },
    }),
    {
      name: "polyglot-design-store",
      partialize: (state) => ({
        elements: state.elements,
        activeBreakpoint: state.activeBreakpoint,
      }),
    }
  )
);

// Debounced helper to trigger history snapshot in canvas store
const triggerHistorySnapshot = debounce(() => {
  const designState = useDesignStore.getState();
  useCanvasStore
    .getState()
    .syncCurrentProjectDesignElements(designState.elements, true);
}, 1000);

// Helper to sync without history (fast updates)
const syncDesignToCanvas = () => {
  const designState = useDesignStore.getState();
  useCanvasStore
    .getState()
    .syncCurrentProjectDesignElements(designState.elements, false);
};

// Hook into state changes to sync with canvas store
useDesignStore.subscribe((state, prevState) => {
  if (state.elements !== prevState.elements) {
    syncDesignToCanvas();
    triggerHistorySnapshot();
  }
});
