import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CanvasComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children: string[];
}

export interface Project {
  id: string;
  name: string;
  components: Record<string, CanvasComponent>;
  rootComponent: string | null;
  createdAt?: string; // add
  updatedAt?: string; // add
}

interface CanvasState {
  projects: Record<string, Project>;
  currentProjectId: string | null;
  currentProject: Project | null;
  history: Project[];
  future: Project[];

  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  addComponent: (type: string, parentId?: string) => string;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  setCurrentProject: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      projects: {},
      currentProjectId: null,
      currentProject: null,
      history: [],
      future: [],

      createProject: (name: string) => {
        const id = "project-" + Date.now();
        const now = new Date().toISOString();
        const newProject: Project = {
          id,
          name,
          components: {},
          rootComponent: null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: { ...state.projects, [id]: newProject },
          currentProjectId: id,
          currentProject: newProject,
        }));
      },

      deleteProject: (id: string) => {
        set((state) => {
          const { [id]: deleted, ...remainingProjects } = state.projects;
          const newCurrentProjectId =
            state.currentProjectId === id ? null : state.currentProjectId;
          const newCurrentProject = newCurrentProjectId
            ? state.projects[newCurrentProjectId] || null
            : null;

          return {
            projects: remainingProjects,
            currentProjectId: newCurrentProjectId,
            currentProject: newCurrentProject,
          };
        });
      },

      addComponent: (type: string, parentId?: string) => {
        const id = "component-" + Date.now();
        set((state) => {
          if (!state.currentProject) return state;

          const newComponent: CanvasComponent = {
            id,
            type,
            props: {},
            children: [],
          };

          const updatedComponents: Record<string, CanvasComponent> = {
            ...state.currentProject.components,
            [id]: newComponent,
          };

          if (parentId && parentId in updatedComponents) {
            const parent = updatedComponents[parentId];
            updatedComponents[parentId] = {
              ...parent,
              children: [...parent.children, id],
            };
          }

          const updatedProject: Project = {
            ...state.currentProject,
            components: updatedComponents,
          };

          return {
            history: [...state.history, state.currentProject],
            future: [],
            currentProject: updatedProject,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: updatedProject,
            },
          };
        });
        return id;
      },

      removeComponent: (id: string) => {
        set((state) => {
          if (!state.currentProject) return state;

          const { [id]: removed, ...rest } = state.currentProject.components;
          const updatedProject: Project = {
            ...state.currentProject,
            components: rest,
          };

          return {
            history: [...state.history, state.currentProject],
            future: [],
            currentProject: updatedProject,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: updatedProject,
            },
          };
        });
      },

      updateComponent: (id: string, updates: Partial<CanvasComponent>) => {
        set((state) => {
          if (!state.currentProject) return state;

          const updatedProject: Project = {
            ...state.currentProject,
            components: {
              ...state.currentProject.components,
              [id]: { ...state.currentProject.components[id], ...updates },
            },
          };

          return {
            currentProject: updatedProject,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: updatedProject,
            },
          };
        });
      },

      setCurrentProject: (id: string) => {
        set((state) => ({
          currentProjectId: id,
          currentProject: state.projects[id] || null,
        }));
      },

      undo: () => {
        set((state) => {
          if (state.history.length === 0) return state;
          const previous = state.history[state.history.length - 1];
          return {
            history: state.history.slice(0, -1),
            future: state.currentProject
              ? [...state.future, state.currentProject]
              : state.future,
            currentProject: previous,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: previous,
            },
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[state.future.length - 1];
          return {
            future: state.future.slice(0, -1),
            history: state.currentProject
              ? [...state.history, state.currentProject]
              : state.history,
            currentProject: next,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: next,
            },
          };
        });
      },
    }),
    { name: "canvas-store" }
  )
);
