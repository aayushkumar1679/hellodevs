import { create } from "zustand";

/* ---------------------------------------------
 Types
---------------------------------------------- */

export type Breakpoint = "desktop" | "tablet" | "mobile";

export interface ResponsiveCss {
  base: Record<string, any>;
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
}

export interface Element {
  id: string;
  type: string;
  cssProperties: ResponsiveCss;
}

interface DesignState {
  elements: Record<string, Element>;
  selectedElements: string[];
  activeBreakpoint: Breakpoint;

  /* element actions */
  addElement: (
    id: string,
    type: string,
    initialCss?: Record<string, any>
  ) => void;

  selectElement: (id: string, multiSelect?: boolean) => void;
  deselectAll: () => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;

  /* breakpoint */
  setActiveBreakpoint: (bp: Breakpoint) => void;

  /* css updates */
  updateCSSProperty: (elementId: string, property: string, value: any) => void;

  updateCSSPropertiesBulk: (
    elementIds: string[],
    property: string,
    value: any
  ) => void;

  /* resolver */
  getResolvedCss: (elementId: string) => Record<string, any>;
}

/* ---------------------------------------------
 Store
---------------------------------------------- */

export const useDesignStore = create<DesignState>((set, get) => ({
  elements: {},
  selectedElements: [],
  activeBreakpoint: "desktop",

  /* -----------------------------------------
     Element creation
  ------------------------------------------ */

  addElement: (id, type, initialCss = {}) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [id]: {
          id,
          type,
          cssProperties: {
            base: {
              display: "block",
              padding: "10px",
              margin: "0",
              ...initialCss,
            },
          },
        },
      },
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
      const { [id]: _, ...rest } = state.elements;
      return {
        elements: rest,
        selectedElements: state.selectedElements.filter((sid) => sid !== id),
      };
    }),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [id]: {
          ...state.elements[id],
          ...updates,
        },
      },
    })),

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
      if (!el) return {};

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
     FINAL RESOLVER (CRITICAL)
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
}));
