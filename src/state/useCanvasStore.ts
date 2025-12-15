import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type CanvasComponent = {
  id: string;
  type: string;
  props?: Record<string, any>;
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  components: CanvasComponent[];
};

interface CanvasState {
  // Projects
  projects: Project[];
  currentProjectId: string | null;

  // Canvas
  componentTree: CanvasComponent[];
  selectedComponentId: string | null;
  history: CanvasComponent[][];
  future: CanvasComponent[][];

  // Project Methods
  createProject: (name: string, components?: CanvasComponent[]) => void;
  deleteProject: (id: string) => void;
  loadProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;

  // Component Methods
  addComponent: (component: CanvasComponent) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void; // ✅ ADD THIS
  updateComponent: (id: string, props: Record<string, any>) => void;
  setTree: (newTree: CanvasComponent[]) => void;
  selectComponent: (id: string | null) => void;

  // History
  undo: () => void;
  redo: () => void;
  clear: () => void;

  hydrate: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        projects: [],
        currentProjectId: null,
        componentTree: [],
        selectedComponentId: null,
        history: [],
        future: [],

        createProject: (name, components = []) => {
          const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            createdAt: new Date().toISOString(),
            components,
          };
          set((state) => ({
            projects: [...state.projects, newProject],
            currentProjectId: newProject.id,
            componentTree: components,
          }));
        },

        deleteProject: (id) => {
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProjectId: null,
            componentTree: [],
          }));
        },

        loadProject: (id) => {
          const project = get().projects.find((p) => p.id === id);
          if (project) {
            set({
              currentProjectId: id,
              componentTree: project.components,
              history: [],
              future: [],
              selectedComponentId: null,
            });
          }
        },

        getProjectById: (id) => {
          return get().projects.find((p) => p.id === id);
        },

        addComponent: (component) => {
          const { componentTree, history, projects, currentProjectId } = get();
          const newTree = [...componentTree, component];

          set({
            componentTree: newTree,
            history: [...history, componentTree],
            future: [],
          });

          if (currentProjectId) {
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === currentProjectId ? { ...p, components: newTree } : p
              ),
            }));
          }
        },

        removeComponent: (id) => {
          const { componentTree, history, projects, currentProjectId } = get();
          const newTree = componentTree.filter((c) => c.id !== id);

          set({
            componentTree: newTree,
            history: [...history, componentTree],
            future: [],
            selectedComponentId: null,
          });

          if (currentProjectId) {
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === currentProjectId ? { ...p, components: newTree } : p
              ),
            }));
          }
        },

        duplicateComponent: (id: string) => {
          const { componentTree, history, projects, currentProjectId } = get();
          const componentToDuplicate = componentTree.find((c) => c.id === id);

          if (!componentToDuplicate) return;

          const duplicated: CanvasComponent = {
            ...componentToDuplicate,
            id: `${componentToDuplicate.type}-${Date.now()}`,
          };

          const newTree = [...componentTree];
          const index = newTree.findIndex((c) => c.id === id);
          newTree.splice(index + 1, 0, duplicated);

          set({
            componentTree: newTree,
            history: [...history, componentTree],
            future: [],
          });

          if (currentProjectId) {
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === currentProjectId ? { ...p, components: newTree } : p
              ),
            }));
          }
        },

        updateComponent: (id, props) => {
          const { componentTree, history, projects, currentProjectId } = get();
          const newTree = componentTree.map((c) =>
            c.id === id ? { ...c, props: { ...c.props, ...props } } : c
          );

          set({
            componentTree: newTree,
            history: [...history, componentTree],
            future: [],
          });

          if (currentProjectId) {
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === currentProjectId ? { ...p, components: newTree } : p
              ),
            }));
          }
        },

        setTree: (newTree) => {
          const { componentTree, history, projects, currentProjectId } = get();

          set({
            componentTree: newTree,
            history: [...history, componentTree],
            future: [],
          });

          if (currentProjectId) {
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === currentProjectId ? { ...p, components: newTree } : p
              ),
            }));
          }
        },

        selectComponent: (id) => {
          set({ selectedComponentId: id });
        },

        undo: () => {
          const { history, componentTree, future, projects, currentProjectId } =
            get();
          if (history.length === 0) return;

          const previous = history[history.length - 1];
          set({
            componentTree: previous,
            history: history.slice(0, -1),
            future: [componentTree, ...future],
          });

          if (currentProjectId) {
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === currentProjectId ? { ...p, components: previous } : p
              ),
            }));
          }
        },

        redo: () => {
          const { history, componentTree, future, projects, currentProjectId } =
            get();
          if (future.length === 0) return;

          const next = future[0];
          set({
            componentTree: next,
            history: [...history, componentTree],
            future: future.slice(1),
          });

          if (currentProjectId) {
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === currentProjectId ? { ...p, components: next } : p
              ),
            }));
          }
        },

        clear: () => {
          const { componentTree, history } = get();
          set({
            componentTree: [],
            history: [...history, componentTree],
            future: [],
          });
        },

        hydrate: () => {
          // Zustand persist middleware handles this automatically
        },
      }),
      {
        name: "canvas-projects",
        version: 1,
      }
    )
  )
);
