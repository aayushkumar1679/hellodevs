// src/state/useBuilderStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";

export type CSSValue = string | number | null | undefined;
export type CSSPropertiesMap = Record<string, CSSValue>;

export type BuilderNode = {
  id: string;
  type: string; // e.g. "div", "text", "image", "group", or custom semantic type
  parentId?: string | null;
  children: string[]; // child node ids
  props?: Record<string, any>; // semantic props (e.g. text content, src)
  css: CSSPropertiesMap; // inline styles - single source of truth
  meta?: {
    locked?: boolean;
    hidden?: boolean;
  };
};
export const CANVAS_ID = "__canvas__";

export type BuilderProject = {
  id: string;
  name: string;
  rootIds: string[]; // top-level nodes order
  nodes: Record<string, BuilderNode>;
  canvasCss: CSSPropertiesMap; // canvas / page level inline styles (background etc)
};

type Snapshot = {
  project: BuilderProject;
  selectedIds: string[];
};

type BuilderState = {
  project: BuilderProject | null;

  // selection
  selectedIds: string[];

  // history
  history: Snapshot[];
  future: Snapshot[];

  // basic getters
  getNode: (id: string) => BuilderNode | undefined;
  getSelectedNodes: () => BuilderNode[];

  // project lifecycle
  createProject: (name?: string) => BuilderProject;
  loadProject: (project: BuilderProject) => void;
  exportProjectJSON: () => string;

  // nodes
  addNode: (
    type: string,
    opts?: {
      parentId?: string | null;
      props?: Record<string, any>;
      css?: CSSPropertiesMap;
      insertBeforeId?: string | null;
      id?: string;
    }
  ) => string;
  removeNode: (id: string) => void;
  updateNodeProps: (id: string, props: Record<string, any>) => void;

  // css
  updateCssProperty: (id: string, key: string, value: CSSValue) => void;
  updateCssPropertiesBulk: (
    ids: string[],
    key: string,
    value: CSSValue
  ) => void;
  setNodeCss: (id: string, css: CSSPropertiesMap) => void;
  setCanvasCss: (css: CSSPropertiesMap) => void;

  // selection
  selectNode: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  toggleSelect: (id: string) => void;
  selectCanvas: () => void;

  // tree ops
  moveNode: (id: string, newParentId: string | null, index?: number) => void;
  groupNodes: (ids: string[], groupType?: string) => string | null;
  ungroupNode: (groupId: string) => void;

  // undo redo
  undo: () => void;
  redo: () => void;

  // util
  clear: () => void;
};

function genId(prefix = "n") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function deepCloneProject(p: BuilderProject): BuilderProject {
  return JSON.parse(JSON.stringify(p));
}

export const useBuilderStore = create<BuilderState>()(
  devtools((set, get) => {
    // initial empty project
    const emptyProject: BuilderProject = {
      id: genId("proj"),
      name: "Untitled",
      rootIds: [],
      nodes: {},
      canvasCss: {},
    };

    function pushHistory() {
      const project = get().project;
      if (!project) return;
      const snap: Snapshot = {
        project: deepCloneProject(project),
        selectedIds: [...get().selectedIds],
      };
      set(
        produce((s: BuilderState) => {
          s.history.push(snap);
          // cap history length to avoid memory explosion
          if (s.history.length > 80) s.history.shift();
          s.future = [];
        })
      );
    }

    return {
      project: emptyProject,
      selectedIds: [],
      history: [],
      future: [],

      getNode: (id: string) => {
        const p = get().project;
        if (!p) return undefined;
        return p.nodes[id];
      },

      getSelectedNodes: () => {
        const p = get().project;
        if (!p) return [];
        return get()
          .selectedIds.map((id) => p.nodes[id])
          .filter(Boolean);
      },

      createProject: (name = "Untitled") => {
        const proj: BuilderProject = {
          id: genId("proj"),
          name,
          rootIds: [],
          nodes: {},
          canvasCss: {},
        };
        set({ project: proj, selectedIds: [], history: [], future: [] });
        return proj;
      },

      loadProject: (project) => {
        set({
          project: deepCloneProject(project),
          selectedIds: [],
          history: [],
          future: [],
        });
      },

      exportProjectJSON: () => {
        const p = get().project;
        return JSON.stringify(p, null, 2);
      },

      addNode: (type, opts = {}) => {
        const project = get().project;
        if (!project) throw new Error("No project loaded");

        const id = opts.id || genId(type);
        const node: BuilderNode = {
          id,
          type,
          parentId: opts.parentId ?? null,
          children: [],
          props: opts.props || {},
          css: opts.css || {},
          meta: {},
        };

        pushHistory();

        // add node
        const newProject = deepCloneProject(project);
        newProject.nodes[id] = node;

        if (node.parentId) {
          const parent = newProject.nodes[node.parentId];
          if (!parent) {
            // parent doesn't exist; add as root
            newProject.rootIds.push(id);
          } else {
            if (opts.insertBeforeId) {
              const idx = parent.children.indexOf(opts.insertBeforeId);
              parent.children.splice(
                idx !== -1 ? idx : parent.children.length,
                0,
                id
              );
            } else {
              parent.children.push(id);
            }
          }
        } else {
          // root
          if (opts.insertBeforeId) {
            const idx = newProject.rootIds.indexOf(opts.insertBeforeId);
            newProject.rootIds.splice(
              idx !== -1 ? idx : newProject.rootIds.length,
              0,
              id
            );
          } else {
            newProject.rootIds.push(id);
          }
        }

        set({ project: newProject });
        return id;
      },

      removeNode: (id) => {
        const project = get().project;
        if (!project) return;
        if (!project.nodes[id]) return;

        pushHistory();

        const newProject = deepCloneProject(project);

        function removeRecursively(nodeId: string) {
          const node = newProject.nodes[nodeId];
          if (!node) return;
          // remove children first
          node.children.forEach((c) => removeRecursively(c));
          // remove from parent children or rootIds
          if (node.parentId) {
            const p = newProject.nodes[node.parentId];
            if (p) p.children = p.children.filter((x) => x !== nodeId);
          } else {
            newProject.rootIds = newProject.rootIds.filter((x) => x !== nodeId);
          }
          delete newProject.nodes[nodeId];
        }

        removeRecursively(id);

        // update selectedIds to remove any removed nodes
        const remainingSelected = get().selectedIds.filter(
          (sid) => !!newProject.nodes[sid]
        );

        set({ project: newProject, selectedIds: remainingSelected });
      },

      updateNodeProps: (id, props) => {
        const project = get().project;
        if (!project) return;
        if (!project.nodes[id]) return;

        pushHistory();

        set(
          produce((s: BuilderState) => {
            const p = s.project!;
            p.nodes[id].props = { ...(p.nodes[id].props || {}), ...props };
          })
        );
      },

      updateCssProperty: (id, key, value) => {
        const project = get().project;
        if (!project) return;
        if (!project.nodes[id]) return;

        pushHistory();

        set(
          produce((s: BuilderState) => {
            const node = s.project!.nodes[id];
            if (!node.css) node.css = {};
            if (value === null || value === undefined || value === "") {
              delete node.css[key];
            } else {
              node.css[key] = value;
            }
          })
        );
      },

      updateCssPropertiesBulk: (ids, key, value) => {
        const project = get().project;
        if (!project) return;

        pushHistory();

        set(
          produce((s: BuilderState) => {
            ids.forEach((id) => {
              const node = s.project!.nodes[id];
              if (!node) return;
              if (!node.css) node.css = {};
              if (value === null || value === undefined || value === "") {
                delete node.css[key];
              } else {
                node.css[key] = value;
              }
            });
          })
        );
      },

      setNodeCss: (id, css) => {
        const project = get().project;
        if (!project) return;
        if (!project.nodes[id]) return;

        pushHistory();

        set(
          produce((s: BuilderState) => {
            s.project!.nodes[id].css = {
              ...(s.project!.nodes[id].css || {}),
              ...css,
            };
          })
        );
      },

      setCanvasCss: (css) => {
        const project = get().project;
        if (!project) return;

        pushHistory();

        set(
          produce((s: BuilderState) => {
            s.project!.canvasCss = { ...(s.project!.canvasCss || {}), ...css };
          })
        );
      },

      selectNode: (id, multi = false) => {
        const project = get().project;
        if (!project) return;
        if (!project.nodes[id]) return;

        set(
          produce((s: BuilderState) => {
            if (!multi) {
              s.selectedIds = [id];
            } else {
              if (!s.selectedIds.includes(id)) s.selectedIds.push(id);
            }
          })
        );
      },

      deselectAll: () => {
        set({ selectedIds: [] });
      },

      toggleSelect: (id) => {
        const project = get().project;
        if (!project) return;
        if (!project.nodes[id]) return;

        set(
          produce((s: BuilderState) => {
            const idx = s.selectedIds.indexOf(id);
            if (idx === -1) s.selectedIds.push(id);
            else s.selectedIds.splice(idx, 1);
          })
        );
      },

      moveNode: (id, newParentId, index) => {
        const project = get().project;
        if (!project) return;
        if (!project.nodes[id]) return;
        if (newParentId && !project.nodes[newParentId]) return;

        pushHistory();

        const newProject = deepCloneProject(project);
        const node = newProject.nodes[id];

        // remove from old parent or root
        if (node.parentId) {
          const oldParent = newProject.nodes[node.parentId];
          if (oldParent)
            oldParent.children = oldParent.children.filter((c) => c !== id);
        } else {
          newProject.rootIds = newProject.rootIds.filter((r) => r !== id);
        }

        // set new parent
        node.parentId = newParentId ?? null;
        if (newParentId) {
          const np = newProject.nodes[newParentId];
          if (!np) {
            // fail safe - add as root
            newProject.rootIds.push(id);
            node.parentId = null;
          } else {
            if (
              typeof index === "number" &&
              index >= 0 &&
              index <= np.children.length
            ) {
              np.children.splice(index, 0, id);
            } else {
              np.children.push(id);
            }
          }
        } else {
          // root
          if (
            typeof index === "number" &&
            index >= 0 &&
            index <= newProject.rootIds.length
          ) {
            newProject.rootIds.splice(index, 0, id);
          } else {
            newProject.rootIds.push(id);
          }
        }

        set({ project: newProject });
      },

      groupNodes: (ids, groupType = "group") => {
        const project = get().project;
        if (!project) return null;
        if (!ids || ids.length === 0) return null;

        // ensure all ids exist and share same parent (or root)
        const nodes = ids.map((i) => project.nodes[i]).filter(Boolean);
        if (nodes.length !== ids.length) return null;

        // Decide insertion parent: lowest common parent (if all same parent) else root
        const parents = new Set(nodes.map((n) => n.parentId || null));
        const parentId = parents.size === 1 ? nodes[0].parentId ?? null : null;

        pushHistory();

        const newProject = deepCloneProject(project);
        const groupId = genId(groupType);
        const groupNode: BuilderNode = {
          id: groupId,
          type: groupType,
          parentId: parentId ?? null,
          children: [],
          props: {},
          css: {},
          meta: {},
        };

        // remove nodes from their parent/root and append to group
        ids.forEach((id) => {
          const node = newProject.nodes[id];
          if (!node) return;
          // remove from parent
          if (node.parentId) {
            const p = newProject.nodes[node.parentId];
            if (p) p.children = p.children.filter((c) => c !== id);
          } else {
            newProject.rootIds = newProject.rootIds.filter((r) => r !== id);
          }
          node.parentId = groupId;
          groupNode.children.push(id);
        });

        // insert group into parent position (use first node position)
        if (groupNode.parentId) {
          const parent = newProject.nodes[groupNode.parentId];
          // insert at position where first node was removed (best-effort: push)
          parent.children.push(groupId);
        } else {
          newProject.rootIds.push(groupId);
        }

        newProject.nodes[groupId] = groupNode;

        set({ project: newProject, selectedIds: [groupId] });
        return groupId;
      },

      ungroupNode: (groupId) => {
        const project = get().project;
        if (!project) return;
        const group = project.nodes[groupId];
        if (!group) return;
        if (!group.children || group.children.length === 0) {
          // simply remove the empty group
          get().removeNode(groupId);
          return;
        }

        pushHistory();

        const newProject = deepCloneProject(project);

        const grp = newProject.nodes[groupId];
        const parentId = grp.parentId ?? null;

        // move each child to group's parent in same order
        grp.children.forEach((childId) => {
          const child = newProject.nodes[childId];
          if (!child) return;
          child.parentId = parentId;
          if (parentId) {
            const p = newProject.nodes[parentId];
            p.children.push(childId);
          } else {
            newProject.rootIds.push(childId);
          }
        });

        // remove group from parent children or rootIds
        if (parentId) {
          const p = newProject.nodes[parentId];
          if (p) p.children = p.children.filter((c) => c !== groupId);
        } else {
          newProject.rootIds = newProject.rootIds.filter((r) => r !== groupId);
        }

        delete newProject.nodes[groupId];

        set({ project: newProject, selectedIds: [] });
      },

      undo: () => {
        const state = get();
        if (state.history.length === 0) return;
        const last = state.history[state.history.length - 1];
        set(
          produce((s: BuilderState) => {
            s.future.unshift({
              project: deepCloneProject(s.project!),
              selectedIds: [...s.selectedIds],
            });
            s.project = deepCloneProject(last.project);
            s.selectedIds = [...last.selectedIds];
            s.history = s.history.slice(0, s.history.length - 1);
          })
        );
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) return;
        const next = state.future[0];
        set(
          produce((s: BuilderState) => {
            s.history.push({
              project: deepCloneProject(s.project!),
              selectedIds: [...s.selectedIds],
            });
            s.project = deepCloneProject(next.project);
            s.selectedIds = [...next.selectedIds];
            s.future = s.future.slice(1);
          })
        );
      },

      clear: () => {
        set({
          project: deepCloneProject(emptyProject),
          selectedIds: [],
          history: [],
          future: [],
        });
      },
    };
  })
);
