// src/state/useCanvasStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import debounce from "lodash.debounce";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";
import { useDesignStore, type Element } from "@/state/useDesignStore";
import type { BlueprintNode } from "@/config/componentRegistry";
import {
  mergeProjectDesignElements,
  normalizeProject,
} from "@/utils/projectModel";

/* -------------------------------------------------
 * Helpers for registry / blueprints
 * ------------------------------------------------- */
const getComponentDef = (type: string) =>
  COMPONENT_LIBRARY.find((c) => c.type === type);

const buildFromBlueprint = (
  blueprint: BlueprintNode,
  add: (node: BlueprintNode, parentId?: string) => string,
  parentId?: string
): string => {
  const id = add(blueprint, parentId);

  // If blueprint node has props or css, we'll rely on updateComponent elsewhere.
  // But we still create subtree.
  if (blueprint.children?.length) {
    blueprint.children.forEach((child: BlueprintNode) => {
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
  props: Record<string, unknown>;
  children: string[];
}

export interface Project {
  id: string;
  name: string;
  components: Record<string, CanvasComponent>;
  designElements: Record<string, Element>;


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
  generationPrompt?: string;
  generationModel?: string;
  generationSummary?: string;
}

export interface ProjectHydrationPayload {
  name?: string;
  components: Record<string, CanvasComponent>;
  rootOrder: string[];
  rootComponent?: string | null;
  designElements?: Record<string, Element>;
  generationPrompt?: string;
  generationModel?: string;
  generationSummary?: string;
}

interface CanvasState {
  projects: Record<string, Project>;
  currentProjectId: string | null;
  currentProject: Project | null;
  history: Project[];
  future: Project[];

  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  hydrateCurrentProject: (payload: ProjectHydrationPayload) => void;

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
  fetchProject: (id: string) => Promise<Project | null>;
  fetchProjects: () => Promise<void>;
   syncCurrentProjectDesignElements: (
    designElements: Record<string, Element>,
    pushToHistory?: boolean
  ) => void;
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

// Debounced helper to save to API
const syncToServer = debounce(async (project: Project) => {
  try {
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
  } catch (error) {
    console.error("Failed to sync project to server", error);
  }
}, 2000); // 2 second debounce

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => {
      /**
       * originalAddComponent - fallback single-component adder used by addComponent
       * Implemented here (closure) so it can call set() and return new id synchronously.
       */
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

          const project = normalizeProject({
            id,
            name,
            components: {},
            designElements: {},
            rootComponent: null,
            rootOrder: [],
            createdAt: now,
            updatedAt: now,
          });

          set((state) => ({
            projects: {
              ...state.projects,
              [id]: project,
            },
            currentProjectId: id,
            currentProject: project,
            history: [],
            future: [],
          }));

          syncToServer(project);
          return id;
        },

        deleteProject: (id) => {
          set((state) => {
            const project = state.projects[id];
            const componentIds = project ? Object.keys(project.components) : [];
            const rest = { ...state.projects };
            delete rest[id];

            if (componentIds.length > 0) {
              useDesignStore.getState().removeElements(componentIds);
            }

            const nextState = {
              projects: rest,
              currentProjectId:
                state.currentProjectId === id ? null : state.currentProjectId,
              currentProject:
                state.currentProjectId === id ? null : state.currentProject,
            };
            return nextState;
          });

          void fetch(`/api/projects/${id}`, {
            method: "DELETE",
          }).catch((error) => {
            console.error("Failed to delete project from server", error);
          });
        },

        hydrateCurrentProject: (payload) => {
          set((state) => {
            if (!state.currentProject || !state.currentProjectId) {
              return state;
            }

            const prev = cloneProject(state.currentProject);
            const project = normalizeProject({
              ...prev,
              name: payload.name ?? prev.name,
              components: payload.components,
              designElements: payload.designElements ?? prev.designElements ?? {},
              rootOrder: payload.rootOrder,
              rootComponent:
                payload.rootComponent ?? payload.rootOrder[0] ?? null,
              generationPrompt: payload.generationPrompt ?? prev.generationPrompt,
              generationModel: payload.generationModel ?? prev.generationModel,
              generationSummary:
                payload.generationSummary ?? prev.generationSummary,
              updatedAt: new Date().toISOString(),
            });

            if (payload.designElements) {
              useDesignStore.getState().replaceElements(payload.designElements);
            }

            const nextState = {
              history: [...state.history, prev],
              future: [],
              currentProject: project,
              projects: {
                ...state.projects,
                [state.currentProjectId]: project,
              },
            };
            syncToServer(project);
            return nextState;
          });
        },

        setCurrentProject: (id) => {
          set((state) => {
            const project = state.projects[id];
            if (!project) return state;
            const normalizedProject = normalizeProject(project);

            const nextState = {
              currentProjectId: id,
              currentProject: normalizedProject,
              projects: {
                ...state.projects,
                [id]: normalizedProject,
              },
              history: [],
              future: [],
            };
            return nextState;
          });
        },

        fetchProject: async (id) => {
          try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) {
              return null;
            }

            const data = (await res.json()) as Project;
            const project = normalizeProject(data);

            set((state) => ({
              projects: {
                ...state.projects,
                [id]: project,
              },
              currentProjectId: id,
              currentProject: project,
              history: [],
              future: [],
            }));

            return project;
          } catch (error) {
            console.error("Failed to fetch project", error);
            return null;
          }
        },

        /* ---------- Components ---------- */
        addComponent: (type, parentId) => {
          const def = getComponentDef(type);
          const projectComponents: Record<string, CanvasComponent> = {};
          // Temporary collection of design data BEFORE it becomes a full 'Element'
          const designData: Record<string, { type: string; css: Record<string, unknown> }> = {};
          
          let rootId = "";

          const recursiveAdd = (node: BlueprintNode, pId?: string): string => {
            const id = `component-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const d = getComponentDef(node.type);

            const props = {
              ...(d?.defaultProps || {}),
              ...(node.props || {}),
            };

            const css = {
              ...(d?.defaultCss || {}),
              ...(node.css || {}),
            };

            projectComponents[id] = {
              id,
              type: node.type,
              props,
              children: [],
            };

            designData[id] = {
              type: node.type,
              css,
            };

            if (pId && projectComponents[pId]) {
              projectComponents[pId].children.push(id);
            }

            if (node.children?.length) {
              node.children.forEach((child) => recursiveAdd(child, id));
            }

            return id;
          };

          const topLevelBlueprint: BlueprintNode = def?.blueprint || { type };
          rootId = recursiveAdd(topLevelBlueprint);

          set((state) => {
            if (!state.currentProject) return state;

            const prev = cloneProject(state.currentProject);
            Object.assign(prev.components, projectComponents);
            
            if (parentId && prev.components[parentId]) {
              prev.components[parentId].children.push(rootId);
            } else {
              prev.rootOrder = prev.rootOrder ?? [];
              prev.rootOrder.push(rootId);
              prev.rootComponent = prev.rootComponent ?? rootId;
            }

            const project: Project = {
              ...prev,
              updatedAt: new Date().toISOString(),
            };

            const nextState = {
              history: [...state.history, state.currentProject],
              future: [],
              currentProject: project,
              projects: {
                ...state.projects,
                [state.currentProjectId!]: project,
              },
            };
            
            syncToServer(project);
            return nextState;
          });

          // Sync with DesignStore
          const designStore = useDesignStore.getState();
          Object.entries(designData).forEach(([id, data]) => {
            designStore.addElement(id, data.type, data.css);
          });

          return rootId;
        },

        removeComponent: (id) => {
          let removedIds: string[] = [];
          set((state) => {
            if (!state.currentProject) return state;

            const prev = cloneProject(state.currentProject);
            const components = { ...prev.components };

            if (!components[id]) return state;

            // collect subtree
            const toRemove = collectSubtree(components, id);
            removedIds = Array.from(toRemove);

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

            const nextState = {
              history: [...state.history, prev],
              future: [],
              currentProject: project,
              projects: {
                ...state.projects,
                [state.currentProjectId!]: project,
              },
            };
            syncToServer(project);
            return nextState;
          });

          if (removedIds.length > 0) {
            useDesignStore.getState().removeElements(removedIds);
          }
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

            const nextState = {
              history: [...state.history, prev],
              future: [],
              currentProject: project,
              projects: {
                ...state.projects,
                [state.currentProjectId!]: project,
              },
            };
            syncToServer(project);
            return nextState;
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

            const nextState = {
              history: [...state.history, prev],
              future: [],
              currentProject: project,
              projects: {
                ...state.projects,
                [state.currentProjectId!]: project,
              },
            };
            syncToServer(project);
            return nextState;
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

            const project = normalizeProject({
              ...prev,
              updatedAt: new Date().toISOString(),
            });

            const nextState = {
              history: [...state.history, state.currentProject],
              future: [],
              currentProject: project,
              projects: {
                ...state.projects,
                [state.currentProjectId!]: project,
              },
            };
            syncToServer(project);
            return nextState;
          });
        },

         syncCurrentProjectDesignElements: (designElements, pushToHistory = false) => {
          
          set((state) => {
            if (!state.currentProject || !state.currentProjectId) {
              return state;
            }

            const mergedDesignElements = mergeProjectDesignElements(
              state.currentProject,
              designElements
            );
            const serializedCurrent = JSON.stringify(
              state.currentProject.designElements
            );
            const serializedNext = JSON.stringify(mergedDesignElements);

            if (serializedCurrent === serializedNext && !pushToHistory) {
              return state;
            }

            const project = normalizeProject({
              ...state.currentProject,
              designElements: mergedDesignElements,
              updatedAt: new Date().toISOString(),
            });

            syncToServer(project);

            return {
              history: pushToHistory
                ? [...state.history, state.currentProject]
                : state.history,
              future: pushToHistory ? [] : state.future,
              currentProject: project,
              projects: {
                ...state.projects,
                [state.currentProjectId]: project,
              },
            };
          });
        },

        /* ---------- Undo / Redo ---------- */

        undo: () => {
          set((state) => {
            if (state.history.length === 0) return state;

            const prev = state.history[state.history.length - 1];

            const nextState = {
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
            if (prev.designElements) {
              useDesignStore.getState().replaceElements(prev.designElements);
            }
            syncToServer(prev);
            return nextState;
          });
        },

        redo: () => {
          set((state) => {
            if (state.future.length === 0) return state;

            const next = state.future[0];

            const nextState = {
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
            if (next.designElements) {
              useDesignStore.getState().replaceElements(next.designElements);
            }
            syncToServer(next);
            return nextState;
          });
        },

        fetchProjects: async () => {
          try {
            const res = await fetch("/api/projects");
            if (!res.ok) return;
            const data = (await res.json()) as Project[];
            
            const projectsMap: Record<string, Project> = {};
            data.forEach((project) => {
              const normalizedProject = normalizeProject(project);
              projectsMap[normalizedProject.id] = normalizedProject;
            });

            set((state) => {
              const currentProjectId =
                state.currentProjectId && projectsMap[state.currentProjectId]
                  ? state.currentProjectId
                  : null;

              return {
                projects: projectsMap,
                currentProjectId,
                currentProject: currentProjectId
                  ? projectsMap[currentProjectId]
                  : null,
              };
            });
          } catch (error) {
            console.error("Failed to fetch projects", error);
          }
        },
      };
    },
    { name: "canvas-store" }
  )
);
