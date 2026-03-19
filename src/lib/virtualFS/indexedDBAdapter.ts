import { VFSAdapter, VirtualFile } from "./index";

const DB_NAME = "polyglot-vfs";
const STORE_NAME = "files";
const VERSION = 1;

export class IndexedDBAdapter implements VFSAdapter {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "path" });
        }
      };
    });
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    const tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  }

  async readFile(path: string): Promise<string> {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(path);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.content);
        } else {
          reject(new Error(`File not found: ${path}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async writeFile(path: string, content: string): Promise<void> {
    const store = await this.getStore("readwrite");
    const file: VirtualFile = {
      path,
      content,
      language: path.split('.').pop() || 'text',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(file);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(path: string): Promise<void> {
    const store = await this.getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(path);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async listFiles(directory?: string): Promise<string[]> {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => {
        let keys = request.result as string[];
        if (directory) {
          keys = keys.filter(k => k.startsWith(directory));
        }
        resolve(keys);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async exists(path: string): Promise<boolean> {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.count(path);
      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(request.error);
    });
  }

  async createDirectory(path: string): Promise<void> {
    // IndexedDB is a flat key-value store, we simulate directories
    return Promise.resolve();
  }
}
