import { create } from "zustand";
import { persist } from "zustand/middleware";

/* -------------------------------------------------
 * Types
 * ------------------------------------------------- */

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

  /**
   * First root component (legacy / optional)
   * Canvas rendering may rely on this
   */
  rootComponent: string | null;

  /**
   * ✅ ORDERED list of root-level components
   * REQUIRED for Layers drag-reorder to work
   */
  rootOrder: string[];

  createdAt?: string;
  updatedAt?: string;
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

  /**
   * Used for re-parenting or move-with-index
   */
  moveComponent: (
    id: string,
    newParentId: string | null,
    index?: number
  ) => void;

  /**
   * ✅ ORDER-ONLY API (SAFE)
   * Used by LayersPanel drag-reorder
   */
  reorderChildren: (parentId: string | null, orderedIds: string[]) => void;

  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;

  setCurrentProject: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

/* -------------------------------------------------
 * Helpers
 * ------------------------------------------------- */

const cloneProject = (p: Project): Project => JSON.parse(JSON.stringify(p));

const collectSubtree = (
  components: Record<string, CanvasComponent>,
  rootId: string,
  acc = new Set<string>()
) => {
  acc.add(rootId);
  components[rootId]?.children.forEach((childId) =>
    collectSubtree(components, childId, acc)
  );
  return acc;
};

/* -------------------------------------------------
 * Store
 * ------------------------------------------------- */

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      projects: {},
      currentProjectId: null,
      currentProject: null,
      history: [],
      future: [],

      /* ---------- Project ---------- */

      createProject: (name) => {
        const id = `project-${Date.now()}`;
        const now = new Date().toISOString();

        const project: Project = {
          id,
          name,
          components: {},
          rootComponent: null,
          rootOrder: [], // ✅ IMPORTANT
          createdAt: now,
          updatedAt: now,
        };

        set(() => ({
          projects: { [id]: project },
          currentProjectId: id,
          currentProject: project,
          history: [],
          future: [],
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.projects;
          return {
            projects: rest,
            currentProjectId:
              state.currentProjectId === id ? null : state.currentProjectId,
            currentProject:
              state.currentProjectId === id ? null : state.currentProject,
          };
        });
      },

      setCurrentProject: (id) => {
        set((state) => {
          const project = state.projects[id];
          if (!project) return state;

          // ✅ MIGRATION: ensure rootOrder exists
          if (!Array.isArray(project.rootOrder)) {
            const rootIds = Object.values(project.components)
              .filter(
                (c) =>
                  !Object.values(project.components).some((p) =>
                    p.children.includes(c.id)
                  )
              )
              .map((c) => c.id);

            project.rootOrder = rootIds;
          }

          return {
            currentProjectId: id,
            currentProject: project,
            history: [],
            future: [],
          };
        });
      },

      /* ---------- Components ---------- */

      addComponent: (type, parentId) => {
        const id = `component-${Date.now()}`;

        set((state) => {
          if (!state.currentProject) return state;

          const prev = cloneProject(state.currentProject);

          const component: CanvasComponent = {
            id,
            type,
            props: {},
            children: [],
          };

          const components = {
            ...prev.components,
            [id]: component,
          };

          if (parentId && components[parentId]) {
            components[parentId].children.push(id);
          }

          const project: Project = {
            ...prev,
            components,
            rootComponent: prev.rootComponent ?? id,

            /**
             * ✅ ADD TO ROOT ORDER ONLY IF NO PARENT
             */
            rootOrder: parentId ? prev.rootOrder : [...prev.rootOrder, id],

            updatedAt: new Date().toISOString(),
          };

          return {
            history: [...state.history, prev],
            future: [],
            currentProject: project,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: project,
            },
          };
        });

        return id;
      },

      removeComponent: (id) => {
        set((state) => {
          if (!state.currentProject) return state;

          const prev = cloneProject(state.currentProject);
          const components = { ...prev.components };

          if (!components[id]) return state;

          const toRemove = collectSubtree(components, id);

          Object.values(components).forEach((c) => {
            c.children = c.children.filter((cid) => !toRemove.has(cid));
          });

          toRemove.forEach((cid) => delete components[cid]);

          const project: Project = {
            ...prev,
            components,

            /**
             * ✅ CLEAN ROOT ORDER
             */
            rootOrder: prev.rootOrder.filter((cid) => !toRemove.has(cid)),

            rootComponent:
              prev.rootComponent && toRemove.has(prev.rootComponent)
                ? null
                : prev.rootComponent,

            updatedAt: new Date().toISOString(),
          };

          return {
            history: [...state.history, prev],
            future: [],
            currentProject: project,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: project,
            },
          };
        });
      },

      /* ---------- MOVE / REORDER ---------- */

      moveComponent: (id, newParentId, index) => {
        set((state) => {
          if (!state.currentProject) return state;

          const prev = cloneProject(state.currentProject);
          const components = { ...prev.components };

          const comp = components[id];
          if (!comp) return state;

          const currentParentEntry = Object.entries(components).find(([, c]) =>
            c.children.includes(id)
          );
          const currentParentId = currentParentEntry
            ? currentParentEntry[0]
            : null;

          // remove from old parent
          if (currentParentId) {
            components[currentParentId].children = components[
              currentParentId
            ].children.filter((cid) => cid !== id);
          } else {
            prev.rootOrder = prev.rootOrder.filter((cid) => cid !== id);
          }

          // add to new parent
          if (newParentId && components[newParentId]) {
            const target = components[newParentId].children;
            const insertAt =
              index === undefined
                ? target.length
                : Math.max(0, Math.min(index, target.length));
            target.splice(insertAt, 0, id);
          } else {
            const insertAt =
              index === undefined
                ? prev.rootOrder.length
                : Math.max(0, Math.min(index, prev.rootOrder.length));
            prev.rootOrder.splice(insertAt, 0, id);
          }

          const project: Project = {
            ...prev,
            components,
            updatedAt: new Date().toISOString(),
          };

          return {
            history: [...state.history, prev],
            future: [],
            currentProject: project,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: project,
            },
          };
        });
      },

      reorderChildren: (parentId, orderedIds) => {
        set((state) => {
          if (!state.currentProject) return state;

          const prev = cloneProject(state.currentProject);
          const components = { ...prev.components };

          if (parentId === null) {
            prev.rootOrder = orderedIds;
          } else {
            if (!components[parentId]) return state;
            components[parentId].children = orderedIds;
          }

          const project: Project = {
            ...prev,
            components,
            updatedAt: new Date().toISOString(),
          };

          return {
            history: [...state.history, prev],
            future: [],
            currentProject: project,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: project,
            },
          };
        });
      },

      updateComponent: (id, updates) => {
        set((state) => {
          if (!state.currentProject) return state;

          const prev = cloneProject(state.currentProject);
          if (!prev.components[id]) return state;

          prev.components[id] = {
            ...prev.components[id],
            ...updates,
          };

          return {
            currentProject: prev,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: prev,
            },
          };
        });
      },

      /* ---------- Undo / Redo ---------- */

      undo: () => {
        set((state) => {
          if (state.history.length === 0) return state;

          const prev = state.history[state.history.length - 1];

          return {
            history: state.history.slice(0, -1),
            future: state.currentProject
              ? [cloneProject(state.currentProject), ...state.future]
              : state.future,
            currentProject: cloneProject(prev),
            projects: {
              ...state.projects,
              [state.currentProjectId!]: cloneProject(prev),
            },
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.future.length === 0) return state;

          const next = state.future[0];

          return {
            history: state.currentProject
              ? [...state.history, cloneProject(state.currentProject)]
              : state.history,
            future: state.future.slice(1),
            currentProject: cloneProject(next),
            projects: {
              ...state.projects,
              [state.currentProjectId!]: cloneProject(next),
            },
          };
        });
      },
    }),
    { name: "canvas-store" }
  )
);
