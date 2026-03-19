import { create } from 'zustand';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFileSystemStore = create<any>(() => ({
  files: {},
  openFiles: [],
  activeFile: null,
  writeFile: async () => {},
  readFile: async () => null,
  init: async () => {},
  createFile: async () => {},
  openFile: () => {},
  closeFile: () => {},
  setActiveFile: () => {},
}));
