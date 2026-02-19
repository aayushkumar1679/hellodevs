// src/state/useCanvasStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";

/* -------------------------------------------------
 * Helpers for registry / blueprints
 * ------------------------------------------------- */
const getComponentDef = (type: string) =>
  COMPONENT_LIBRARY.find((c) => c.type === type);

const buildFromBlueprint = (
  blueprint: any,
  add: (type: string, parentId?: string) => string,
  parentId?: string
): string => {
  const id = add(blueprint.type, parentId);

  // If blueprint node has props or css, we'll rely on updateComponent elsewhere.
  // But we still create subtree.
  if (blueprint.children?.length) {
    blueprint.children.forEach((child: any) => {
      buildFromBlueprint(child, add, id);
    });
  }

  return id;
};

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
   */
  rootComponent: string | null;

  /**
   * Ordered list of root-level components (required)
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

  moveComponent: (
    id: string,
    newParentId: string | null,
    index?: number
  ) => void;

  reorderChildren: (parentId: string | null, orderedIds: string[]) => void;

  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;

  setCurrentProject: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

/* -------------------------------------------------
 * Local helpers
 * ------------------------------------------------- */

/** Deep clone to protect undo history */
const cloneProject = (p: Project): Project => JSON.parse(JSON.stringify(p));

/** Recursively collect component subtree */
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
    (set, get) => {
      /**
       * originalAddComponent - fallback single-component adder used by addComponent
       * Implemented here (closure) so it can call set() and return new id synchronously.
       */
      const originalAddComponent = (type: string, parentId?: string) => {
        let newId = "";
        set((state) => {
          if (!state.currentProject) return state;

          const prev = cloneProject(state.currentProject);

          const id = `component-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;

          // initialize props from registry defaultProps if present
          const def = getComponentDef(type);

          prev.components[id] = {
            id,
            type,
            props: def?.defaultProps ? { ...def.defaultProps } : {},
            children: [],
          };

          if (parentId && prev.components[parentId]) {
            prev.components[parentId].children.push(id);
          } else {
            // insert into rootOrder
            prev.rootOrder = prev.rootOrder ?? [];
            prev.rootOrder.push(id);
            prev.rootComponent = prev.rootComponent ?? id;
          }

          const project: Project = {
            ...prev,
            updatedAt: new Date().toISOString(),
          };

          newId = id;

          return {
            history: [...state.history, cloneProject(state.currentProject)],
            future: [],
            currentProject: project,
            projects: {
              ...state.projects,
              [state.currentProjectId!]: project,
            },
          };
        });

        return newId;
      };

      return {
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
            rootOrder: [],
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

            // MIGRATION: ensure rootOrder exists and fallback to computed root ids
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

            // ensure arrays exist
            project.rootOrder = project.rootOrder ?? [];
            project.components = project.components ?? {};
            project.rootComponent =
              project.rootComponent ?? project.rootOrder[0] ?? null;

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
          const def = getComponentDef(type);

          // If component type has a blueprint -> expand into multiple nodes
          if (def?.blueprint) {
            // We'll expand the blueprint in a single set() call to keep history coherent.
            let rootId = "";
            set((state) => {
              if (!state.currentProject) return state;

              const prev = cloneProject(state.currentProject);

              // temporary add function used by buildFromBlueprint
              const add = (t: string, p?: string) => {
                const id = `component-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 9)}`;

                const d = getComponentDef(t);

                prev.components[id] = {
                  id,
                  type: t,
                  props: d?.defaultProps ? { ...d.defaultProps } : {},
                  children: [],
                };

                if (p && prev.components[p]) {
                  prev.components[p].children.push(id);
                } else {
                  prev.rootOrder = prev.rootOrder ?? [];
                  prev.rootOrder.push(id);
                  prev.rootComponent = prev.rootComponent ?? id;
                }

                return id;
              };

              // build from blueprint, starting at optional parentId
              rootId = buildFromBlueprint(def.blueprint, add, parentId);

              // ensure rootComponent exists
              prev.rootComponent = prev.rootComponent ?? rootId;
              prev.rootOrder = prev.rootOrder ?? [];

              const project: Project = {
                ...prev,
                updatedAt: new Date().toISOString(),
              };

              return {
                history: [...state.history, cloneProject(state.currentProject)],
                future: [],
                currentProject: project,
                projects: {
                  ...state.projects,
                  [state.currentProjectId!]: project,
                },
              };
            });

            return rootId;
          }

          // Fallback: single component - delegate to originalAddComponent helper
          return originalAddComponent(type, parentId);
        },

        removeComponent: (id) => {
          set((state) => {
            if (!state.currentProject) return state;

            const prev = cloneProject(state.currentProject);
            const components = { ...prev.components };

            if (!components[id]) return state;

            // collect subtree
            const toRemove = collectSubtree(components, id);

            // remove references from parents
            Object.values(components).forEach((c) => {
              c.children = c.children.filter((cid) => !toRemove.has(cid));
            });

            // delete subtree
            toRemove.forEach((cid) => {
              delete components[cid];
            });

            const project: Project = {
              ...prev,
              components,

              // CLEAN rootOrder from removed ids
              rootOrder: (prev.rootOrder || []).filter(
                (cid) => !toRemove.has(cid)
              ),

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

            // find current parent (if any)
            const currentParentEntry = Object.entries(components).find(
              ([, c]) => c.children.includes(id)
            );
            const currentParentId = currentParentEntry
              ? currentParentEntry[0]
              : null;

            // remove from old parent or rootOrder
            if (currentParentId) {
              components[currentParentId] = {
                ...components[currentParentId],
                children: components[currentParentId].children.filter(
                  (cid) => cid !== id
                ),
              };
            } else {
              prev.rootOrder = (prev.rootOrder || []).filter(
                (cid) => cid !== id
              );
            }

            // add to new parent children OR rootOrder at index
            if (newParentId && components[newParentId]) {
              const targetChildren = [...components[newParentId].children];
              const insertIndex =
                index === undefined
                  ? targetChildren.length
                  : Math.max(0, Math.min(index, targetChildren.length));
              targetChildren.splice(insertIndex, 0, id);
              components[newParentId] = {
                ...components[newParentId],
                children: targetChildren,
              };
            } else {
              prev.rootOrder = prev.rootOrder ?? [];
              const insertIndex =
                index === undefined
                  ? prev.rootOrder.length
                  : Math.max(0, Math.min(index, prev.rootOrder.length));
              prev.rootOrder.splice(insertIndex, 0, id);
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
              components[parentId] = {
                ...components[parentId],
                children: orderedIds,
              };
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
      };
    },
    { name: "canvas-store" }
  )
);
