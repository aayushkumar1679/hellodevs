import { create } from 'zustand';

interface WebContainerState {
  /** URL of the dev server once WebContainer has booted and started a server */
  devServerUrl: string | null;
  /** Whether the WebContainer is currently booting */
  booting: boolean;
  /** Whether a dev server process is running */
  serverRunning: boolean;
  setDevServerUrl: (url: string | null) => void;
  setBooting: (booting: boolean) => void;
  setServerRunning: (running: boolean) => void;
}

export const useWebContainerStore = create<WebContainerState>((set) => ({
  devServerUrl: null,
  booting: false,
  serverRunning: false,
  setDevServerUrl: (url) => set({ devServerUrl: url }),
  setBooting: (booting) => set({ booting }),
  setServerRunning: (serverRunning) => set({ serverRunning }),
}));
