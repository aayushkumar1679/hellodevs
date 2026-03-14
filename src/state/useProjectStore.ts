import { create } from "zustand";
import { persist } from "zustand/middleware";
import debounce from "lodash.debounce";
import { COMPONENT_LIBRARY, BlueprintNode } from "@/config/componentRegistry";
import { toast } from "sonner";
import type { Breakpoint } from "@/state/useEditorStore";
import { AnimationConfig } from "@/config/animationPresets";

export type CSSProperties = Record<string, unknown>;

export interface PolyglotComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  cssOverrides: {
    base: CSSProperties;
    tablet?: CSSProperties;
    mobile?: CSSProperties;
  };
  animations: AnimationConfig[];
  assets: { key: string; url: string }[];
  children: string[];
  meta: { locked?: boolean; hidden?: boolean; label?: string };
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: "image" | "generation";
  date: string;
}

export interface CustomComponent {
  id: string;
  name: string;
  code: string;
  category: string;
  icon?: string;
  createdAt: string;
}

export interface PolyglotProject {
  id: string;
  name: string;
  components: Record<string, PolyglotComponent>;
  rootComponent: string | null;
  rootOrder: string[];
  assets: Asset[];
  customComponents?: Record<string, CustomComponent>;
  createdAt?: string;
  updatedAt?: string;
  generationPrompt?: string;
  generationModel?: string;
  generationSummary?: string;
  designSystem?: {
    colors: {
      background: string;
      surface: string;
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

export interface ProjectStoreState {
  projects: Record<string, PolyglotProject>;
  currentProjectId: string | null;
  currentProject: PolyglotProject | null;
  isLoading: boolean;
  
  history: PolyglotProject[];
  future: PolyglotProject[];

  // Project CRUD
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  fetchProject: (id: string) => Promise<PolyglotProject | null>;
  fetchProjects: () => Promise<void>;
  saveProject: () => Promise<void>;

  // Component CRUD
  addComponent: (type: string, parentId?: string, overrideProps?: Record<string, any>) => string;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<PolyglotComponent>) => void;
  moveComponent: (id: string, newParentId: string | null, index?: number) => void;
  reorderChildren: (parentId: string | null, orderedIds: string[]) => void;

  // Assets
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;

  // CSS CRUD
  updateComponentCSSOverride: (id: string, breakpoint: Breakpoint, key: string, value: unknown) => void;
  getResolvedCss: (id: string, activeBreakpoint: Breakpoint) => CSSProperties;

  // Undo/Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Project top-level update
  duplicateProject: (id: string) => void;
  updateProject: (updates: Partial<PolyglotProject>) => void;
  addCustomComponent: (comp: Omit<CustomComponent, "id" | "createdAt">) => string;
  removeCustomComponent: (id: string) => void;
}

const getComponentDef = (type: string) => COMPONENT_LIBRARY.find((c) => c.type === type);
const cloneObj = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const collectSubtree = (
  components: Record<string, PolyglotComponent>,
  rootId: string,
  acc = new Set<string>()
) => {
  acc.add(rootId);
  components[rootId]?.children.forEach((childId) => collectSubtree(components, childId, acc));
  return acc;
};

const syncToServer = debounce(async (project: PolyglotProject) => {
  try {
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
  } catch (error) {
    console.error("Failed to sync project to server", error);
  }
}, 2000);

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      projects: {},
      currentProjectId: null,
    currentProject: null,
    isLoading: false,
      history: [],
      future: [],

      pushHistory: () => {
        set((state) => {
          if (!state.currentProject) return state;
          // Keep history limited to 50 items
          const newHistory = [...state.history, cloneObj(state.currentProject)].slice(-50);
          return { history: newHistory, future: [] };
        });
      },

      undo: () => {
        set((state) => {
          if (state.history.length === 0) return state;
          const prev = state.history[state.history.length - 1];
          const newHistory = state.history.slice(0, -1);
          
          if (state.currentProject) {
            syncToServer(prev);
            return {
              history: newHistory,
              future: [cloneObj(state.currentProject), ...state.future],
              currentProject: cloneObj(prev),
              projects: {
                ...state.projects,
                [state.currentProjectId!]: cloneObj(prev),
              },
            };
          }
          return state;
        });
      },

      redo: () => {
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          
          if (state.currentProject) {
            syncToServer(next);
            return {
              history: [...state.history, cloneObj(state.currentProject)],
              future: newFuture,
              currentProject: cloneObj(next),
              projects: {
                ...state.projects,
                [state.currentProjectId!]: cloneObj(next),
              },
            };
          }
          return state;
        });
      },

      createProject: (name: string) => {
        const id = `project-${Date.now()}`;
        const now = new Date().toISOString();
        
        const project: PolyglotProject = {
          id,
          name,
          components: {},
          rootComponent: null,
          rootOrder: [],
          assets: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          projects: { ...state.projects, [id]: project },
          currentProjectId: id,
          currentProject: project,
          history: [],
          future: [],
        }));

        const store = get();
        ["navbar", "hero", "feature-section", "testimonial-section", "cta", "footer"].forEach(t => store.addComponent(t));
        
        return id;
      },

      duplicateProject: (id: string) => {
        set((state) => {
          const originalProject = state.projects[id];
          if (!originalProject) return state;

          const newId = `project-${Date.now()}-copy`;
          const now = new Date().toISOString();
          const duplicatedProject: PolyglotProject = {
            ...cloneObj(originalProject),
            id: newId,
            name: `${originalProject.name} (Copy)`,
            createdAt: now,
            updatedAt: now,
          };

          return {
            projects: { ...state.projects, [newId]: duplicatedProject },
            currentProjectId: newId,
            currentProject: duplicatedProject,
            history: [],
            future: [],
          };
        });
      },

      updateProject: (updates) => {
      set((state) => {
        if (!state.currentProject) return state;
        const updated = { ...state.currentProject, ...updates };
        return {
          currentProject: updated,
          projects: { ...state.projects, [updated.id]: updated },
        };
      });
    },

      deleteProject: (id: string) => {
        set((state) => {
          const rest = { ...state.projects };
          delete rest[id];
          return {
            projects: rest,
            currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
            currentProject: state.currentProjectId === id ? null : state.currentProject,
          };
        });
        fetch(`/api/projects/${id}`, { method: "DELETE" }).catch(console.error);
      },

      setCurrentProject: (id: string) => {
        set((state) => {
          const project = state.projects[id];
          if (!project) return state;
          return {
            currentProjectId: id,
            currentProject: cloneObj(project),
            history: [],
            future: [],
          };
        });
      },

      fetchProject: async (id: string) => {
        try {
          const res = await fetch(`/api/projects/${id}`);
          if (!res.ok) return null;
          const project = (await res.json()) as PolyglotProject;
          set((state) => ({
            projects: { ...state.projects, [id]: project },
            currentProjectId: id,
            currentProject: project,
            history: [],
            future: [],
          }));
          return project;
        } catch (error) {
          console.error(error);
          return null;
        }
      },

      fetchProjects: async () => {
        try {
          const res = await fetch("/api/projects");
          if (!res.ok) return;
          const data = (await res.json()) as PolyglotProject[];
          const projectsMap: Record<string, PolyglotProject> = {};
          data.forEach(p => (projectsMap[p.id] = p));
          set((state) => {
            const currentProjectId = state.currentProjectId && projectsMap[state.currentProjectId] ? state.currentProjectId : null;
            return {
              projects: projectsMap,
              currentProjectId,
              currentProject: currentProjectId ? projectsMap[currentProjectId] : null,
            };
          });
        } catch (error) { console.error(error); }
      },

      saveProject: async () => {
        const state = get();
        if (!state.currentProject) return;
        toast.promise(
          fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state.currentProject),
          }).then(async res => {
            if (!res.ok) throw new Error("Save failed");
            return res.json();
          }),
          { loading: "Saving...", success: "Saved!", error: "Failed to save" }
        );
      },

      addComponent: (type: string, parentId?: string, overrideProps?: Record<string, any>) => {
        get().pushHistory();
        
        const def = getComponentDef(type);
        const projectComponents: Record<string, PolyglotComponent> = {};
        let rootId = "";

        const recursiveAdd = (node: BlueprintNode, pId?: string): string => {
          const id = `component-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const d = getComponentDef(node.type);

          projectComponents[id] = {
            id,
            type: node.type,
            props: { ...(d?.defaultProps || {}), ...(node.props || {}), ...(pId ? {} : (overrideProps || {})) },
            cssOverrides: { base: { ...(d?.defaultCss || {}), ...(node.css || {}) } },
            animations: [],
            assets: [],
            children: [],
            meta: {},
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
          const prev = cloneObj(state.currentProject);
          Object.assign(prev.components, projectComponents);
          
          if (parentId && prev.components[parentId]) {
            prev.components[parentId].children.push(rootId);
          } else {
            prev.rootOrder.push(rootId);
            prev.rootComponent = prev.rootComponent ?? rootId;
          }
          prev.updatedAt = new Date().toISOString();
          
          syncToServer(prev);
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
        
        return rootId;
      },

      removeComponent: (id: string) => {
        get().pushHistory();
        set((state) => {
          if (!state.currentProject) return state;
          const prev = cloneObj(state.currentProject);
          const components = prev.components;

          if (!components[id]) return state;
          const toRemove = collectSubtree(components, id);

          Object.values(components).forEach((c) => {
            c.children = c.children.filter((cid) => !toRemove.has(cid));
          });
          toRemove.forEach((cid) => delete components[cid]);

          prev.rootOrder = prev.rootOrder.filter((cid) => !toRemove.has(cid));
          if (prev.rootComponent && toRemove.has(prev.rootComponent)) {
             prev.rootComponent = null;
          }
          prev.updatedAt = new Date().toISOString();
          syncToServer(prev);
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
      },

      updateComponent: (id: string, updates: Partial<PolyglotComponent>) => {
        get().pushHistory();
        set((state) => {
          if (!state.currentProject) return state;
          const prev = cloneObj(state.currentProject);
          if (!prev.components[id]) return state;

          prev.components[id] = { ...prev.components[id], ...updates };
          prev.updatedAt = new Date().toISOString();
          
          syncToServer(prev);
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
      },

      updateComponentCSSOverride: (id, breakpoint, key, value) => {
        get().pushHistory();
        set((state) => {
          if (!state.currentProject) return state;
          const prev = cloneObj(state.currentProject);
          const comp = prev.components[id];
          if (!comp) return state;

          if (breakpoint === "desktop") {
            comp.cssOverrides.base = { ...comp.cssOverrides.base, [key]: value };
          } else {
            comp.cssOverrides[breakpoint] = { ...(comp.cssOverrides[breakpoint] || {}), [key]: value };
          }
          
          prev.updatedAt = new Date().toISOString();
          syncToServer(prev);
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
      },

      getResolvedCss: (id, activeBreakpoint) => {
        const state = get();
        if (!state.currentProject) return {};
        const comp = state.currentProject.components[id];
        if (!comp) return {};

        const { base, tablet, mobile } = comp.cssOverrides;
        if (activeBreakpoint === "mobile") return { ...base, ...(tablet || {}), ...(mobile || {}) };
        if (activeBreakpoint === "tablet") return { ...base, ...(tablet || {}) };
        return { ...base };
      },

      moveComponent: (id, newParentId, index) => {
        get().pushHistory();
        set((state) => {
          if (!state.currentProject) return state;
          const prev = cloneObj(state.currentProject);
          const components = prev.components;
          if (!components[id]) return state;

          const currentParentEntry = Object.entries(components).find(([, c]) => c.children.includes(id));
          if (currentParentEntry) {
            currentParentEntry[1].children = currentParentEntry[1].children.filter(cid => cid !== id);
          } else {
            prev.rootOrder = prev.rootOrder.filter(cid => cid !== id);
          }

          if (newParentId && components[newParentId]) {
            const targetChildren = components[newParentId].children;
            const insertIndex = index === undefined ? targetChildren.length : Math.max(0, Math.min(index, targetChildren.length));
            targetChildren.splice(insertIndex, 0, id);
          } else {
            const insertIndex = index === undefined ? prev.rootOrder.length : Math.max(0, Math.min(index, prev.rootOrder.length));
            prev.rootOrder.splice(insertIndex, 0, id);
          }

          prev.updatedAt = new Date().toISOString();
          syncToServer(prev);
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
      },

      reorderChildren: (parentId, orderedIds) => {
        get().pushHistory();
        set((state) => {
          if (!state.currentProject) return state;
          const prev = cloneObj(state.currentProject);
          
          if (parentId === null) {
            prev.rootOrder = orderedIds;
          } else if (prev.components[parentId]) {
            prev.components[parentId].children = orderedIds;
          }

          prev.updatedAt = new Date().toISOString();
          syncToServer(prev);
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
      },

      addAsset: (asset) => {
        set((state) => {
          if (!state.currentProject) return state;
          const prev = cloneObj(state.currentProject);
          prev.assets = [asset, ...(prev.assets || [])];
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
      },

      removeAsset: (assetId) => {
        set((state) => {
          if (!state.currentProject) return state;
          const prev = cloneObj(state.currentProject);
          prev.assets = (prev.assets || []).filter(a => a.id !== assetId);
          return { currentProject: prev, projects: { ...state.projects, [state.currentProjectId!]: prev } };
        });
      },

      addCustomComponent: (comp) => {
        const id = `custom-${Math.random().toString(36).substring(2, 9)}`;
        const now = new Date().toISOString();
        const newComp: CustomComponent = { ...comp, id, createdAt: now };

        set((state) => {
          if (!state.currentProject) return state;
          const customComponents = {
            ...(state.currentProject.customComponents || {}),
            [id]: newComp,
          };
          const updated = { ...state.currentProject, customComponents };
          return {
            currentProject: updated,
            projects: { ...state.projects, [updated.id]: updated },
          };
        });
        toast.success(`Custom component "${comp.name}" registered`);
        return id;
      },

      removeCustomComponent: (id) => {
        set((state) => {
          if (!state.currentProject || !state.currentProject.customComponents) return state;
          const { [id]: _, ...rest } = state.currentProject.customComponents;
          const updated = { ...state.currentProject, customComponents: rest };
          return {
            currentProject: updated,
            projects: { ...state.projects, [updated.id]: updated },
          };
        });
      },


    }),
    { name: "polyglot-project-store" }
  )
);
