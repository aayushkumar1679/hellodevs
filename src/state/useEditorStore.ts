import { create } from 'zustand';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEditorStore = create<any>(() => ({
  selectedElements: [],
  viewMode: 'desktop',
  activeBreakpoint: 'desktop',
  breakpoints: {},
  previewEnabled: false,
  threeEnabled: false,
  threeSpeed: 0,
  threeDensity: 0,
  draggedId: null,
  setSelectedElements: () => {},
  deselectAll: () => {},
  selectElement: () => {},
  setBreakpoint: () => {},
  togglePreview: () => {},
  setViewMode: () => {},
  setDraggedId: () => {},
  toggleThree: () => {},
  setThreeSpeed: () => {},
  setThreeDensity: () => {},
}));
