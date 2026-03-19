export interface VirtualFile {
  path: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VFSAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listFiles(directory?: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  createDirectory(path: string): Promise<void>;
}

export class VirtualFileSystem {
  private adapter: VFSAdapter;
  private listeners: Record<string, Set<() => void>> = {};

  constructor(adapter: VFSAdapter) {
    this.adapter = adapter;
  }

  async readFile(path: string): Promise<string> {
    return this.adapter.readFile(path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.adapter.writeFile(path, content);
    this.notify(path);
  }

  async deleteFile(path: string): Promise<void> {
    await this.adapter.deleteFile(path);
    this.notify(path);
  }

  async listFiles(directory?: string): Promise<string[]> {
    return this.adapter.listFiles(directory);
  }

  async exists(path: string): Promise<boolean> {
    return this.adapter.exists(path);
  }

  async createDirectory(path: string): Promise<void> {
    await this.adapter.createDirectory(path);
    this.notify(path);
  }

  watch(path: string, callback: () => void): () => void {
    if (!this.listeners[path]) {
      this.listeners[path] = new Set();
    }
    this.listeners[path].add(callback);
    return () => {
      this.listeners[path].delete(callback);
      if (this.listeners[path].size === 0) {
        delete this.listeners[path];
      }
    };
  }

  private notify(path: string) {
    if (this.listeners[path]) {
      this.listeners[path].forEach((cb) => cb());
    }
    if (this.listeners['*']) {
      this.listeners['*'].forEach((cb) => cb());
    }
  }
}
