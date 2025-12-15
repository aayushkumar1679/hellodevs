import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CanvasState {
  componentTree: any[];
  history: any[];
  future: any[];
  setTree: (newTree: any[]) => void;
  undo: () => void;
  redo: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  devtools((set, get) => ({
    componentTree: [],
    history: [],
    future: [],
    setTree: (newTree) => {
      const { componentTree, history } = get();
      set({
        componentTree: newTree,
        history: [...history, componentTree],
        future: [],
      });
    },
    undo: () => {
      const { history, componentTree, future } = get();
      if (history.length === 0) return;
      const previous = history[history.length - 1];
      set({
        componentTree: previous,
        history: history.slice(0, -1),
        future: [componentTree, ...future],
      });
    },
    redo: () => {
      const { history, componentTree, future } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        componentTree: next,
        history: [...history, componentTree],
        future: future.slice(1),
      });
    },
  }))
);
