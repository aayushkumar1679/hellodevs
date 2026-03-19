import { create } from "zustand";

export type AgentMode = "design" | "code" | "architect" | "screenshot";

interface AgentState {
  isOpen: boolean;
  mode: AgentMode;
  isProcessing: boolean;
  history: any[]; // we'll type this later
  setMode: (mode: AgentMode) => void;
  togglePanel: () => void;
  setProcessing: (status: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  isOpen: false,
  mode: "architect",
  isProcessing: false,
  history: [],
  setMode: (mode) => set({ mode }),
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  setProcessing: (status) => set({ isProcessing: status }),
}));
