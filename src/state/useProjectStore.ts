import { create } from 'zustand';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PolyglotProject = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PolyglotComponent = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CSSProperties = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useProjectStore = create<any>(() => ({
  currentProject: null,
  projects: {},
  currentProjectId: null,
  customComponents: [],
  history: [],
  updateProject: () => {},
  addComponent: () => {},
  updateComponent: () => {},
  removeComponent: () => {},
  addAsset: () => {},
  setCurrentProject: () => {},
  fetchProject: () => {},
  fetchProjects: () => {},
  createProject: () => {},
  deleteProject: () => {},
  updateComponentCSSOverride: () => {},
  saveProject: () => {},
  moveComponent: () => {},
  undo: () => {},
  redo: () => {},
  getResolvedCss: () => {},
  addCustomComponent: () => {},
  removeCustomComponent: () => {},
}));
