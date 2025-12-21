import { create } from "zustand";

export interface Element {
  id: string;
  type: string;
  cssProperties: Record<string, any>;
}

interface DesignState {
  elements: Record<string, Element>;
  selectedElements: string[];
  addElement: (id: string, type: string) => void;
  selectElement: (id: string, multiSelect?: boolean) => void;
  deselectAll: () => void;
  updateCSSProperty: (elementId: string, property: string, value: any) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  elements: {},
  selectedElements: [],

  addElement: (id, type) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [id]: {
          id,
          type,
          cssProperties: {
            display: "block",
            padding: "10px",
            margin: "0",
          },
        },
      },
    })),

  selectElement: (id, multiSelect = false) =>
    set((state) => {
      if (multiSelect) {
        return {
          selectedElements: state.selectedElements.includes(id)
            ? state.selectedElements.filter((sid) => sid !== id)
            : [...state.selectedElements, id],
        };
      }
      return { selectedElements: [id] };
    }),

  deselectAll: () => set({ selectedElements: [] }),

  updateCSSProperty: (elementId, property, value) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [elementId]: {
          ...state.elements[elementId],
          cssProperties: {
            ...state.elements[elementId]?.cssProperties,
            [property]: value,
          },
        },
      },
    })),

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
}));
