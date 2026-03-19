import { create } from "zustand";
import { VirtualFileSystem, VirtualFile } from "@/lib/virtualFS";
import { IndexedDBAdapter } from "@/lib/virtualFS/indexedDBAdapter";
import { fileWatcher } from "@/lib/virtualFS/fileWatcher";

// Singleton VFS
export const vfs = new VirtualFileSystem(new IndexedDBAdapter());

interface FileSystemState {
  files: Record<string, VirtualFile>;
  openFiles: string[];
  activeFile: string | null;
  // Actions
  init: () => Promise<void>;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  writeFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  createFile: (path: string, content?: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  files: {},
  openFiles: [],
  activeFile: null,

  init: async () => {
    const syncFiles = async () => {
      const paths = await vfs.listFiles();
      const loadedFiles: Record<string, VirtualFile> = {};
      for (const path of paths) {
        try {
          const content = await vfs.readFile(path);
          loadedFiles[path] = {
            path,
            content,
            language: path.split('.').pop() || 'text',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        } catch (e) {
          console.error(`Failed to read ${path}`, e);
        }
      }
      set({ files: loadedFiles });
    };

    await syncFiles();

    // Subscribe to changes globally
    vfs.watch('*', async () => {
      await syncFiles();
    });
  },

  openFile: (path) => set((state) => {
    const openFiles = state.openFiles.includes(path) ? state.openFiles : [...state.openFiles, path];
    return { openFiles, activeFile: path };
  }),

  closeFile: (path) => set((state) => {
    const openFiles = state.openFiles.filter(p => p !== path);
    const activeFile = state.activeFile === path ? (openFiles[openFiles.length - 1] || null) : state.activeFile;
    return { openFiles, activeFile };
  }),

  setActiveFile: (path) => set({ activeFile: path }),

  writeFile: async (path, content) => {
    await vfs.writeFile(path, content);
    fileWatcher.emit(path, content);
  },

  deleteFile: async (path) => {
    await vfs.deleteFile(path);
    set((state) => {
      const openFiles = state.openFiles.filter(p => p !== path);
      const activeFile = state.activeFile === path ? (openFiles[openFiles.length - 1] || null) : state.activeFile;
      return { openFiles, activeFile };
    });
  },

  createFile: async (path, content = "") => {
    await vfs.writeFile(path, content);
  },

  renameFile: async (oldPath, newPath) => {
    const content = await vfs.readFile(oldPath);
    await vfs.writeFile(newPath, content);
    await vfs.deleteFile(oldPath);
    set((state) => {
      const openFiles = state.openFiles.map(p => p === oldPath ? newPath : p);
      const activeFile = state.activeFile === oldPath ? newPath : state.activeFile;
      return { openFiles, activeFile };
    });
  }
}));
