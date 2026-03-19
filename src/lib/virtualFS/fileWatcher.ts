/**
 * fileWatcher.ts — singleton file-watch registry for the virtual FS
 *
 * Usage:
 *   const unsub = fileWatcher.watch('/src/App.tsx', () => { ... });
 *   fileWatcher.notify('/src/App.tsx');   // called by VFS write/delete
 *   unsub();                              // cleanup
 */

type WatchCallback = () => void;
type ContentCallback = (path: string, content: string) => void;

class FileWatcher {
  private listeners: Map<string, Set<WatchCallback>> = new Map();
  private contentListeners: Map<string, Set<ContentCallback>> = new Map();

  /** Subscribe to changes on a specific path (or '*' for all). Returns an unsubscribe fn. */
  watch(path: string, cb: WatchCallback): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path)!.add(cb);

    return () => {
      const set = this.listeners.get(path);
      if (set) {
        set.delete(cb);
        if (set.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
  }

  /** Notify listeners for a specific path AND wildcard listeners. */
  notify(path: string): void {
    this.listeners.get(path)?.forEach((cb) => cb());
    this.listeners.get("*")?.forEach((cb) => cb());
  }

  /**
   * Emit a file change with content — called by VFS writeFile.
   * Triggers both path-specific and wildcard ('*') listeners.
   */
  emit(path: string, content: string): void {
    this.contentListeners.get(path)?.forEach((cb) => cb(path, content));
    this.contentListeners.get("*")?.forEach((cb) => cb(path, content));
    // Also trigger plain WatchCallbacks for backward compat
    this.notify(path);
  }

  /**
   * Subscribe to all file changes (content-aware).
   * Returns an unsubscribe fn.
   */
  watchAll(cb: ContentCallback): () => void {
    if (!this.contentListeners.has("*")) {
      this.contentListeners.set("*", new Set());
    }
    this.contentListeners.get("*")!.add(cb);
    return () => {
      const set = this.contentListeners.get("*");
      if (set) {
        set.delete(cb);
        if (set.size === 0) this.contentListeners.delete("*");
      }
    };
  }

  /** Remove all listeners (useful for hot-reload / test teardown). */
  clear(): void {
    this.listeners.clear();
    this.contentListeners.clear();
  }

  /** How many unique paths are being watched. */
  get watchedCount(): number {
    return this.listeners.size;
  }
}

export const fileWatcher = new FileWatcher();
