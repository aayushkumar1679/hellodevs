import { VFSAdapter } from "./index";

export class FileSystemAccessAdapter implements VFSAdapter {
  async readFile(path: string): Promise<string> {
    throw new Error("FileSystemAccessAdapter not implemented natively yet. Use IndexedDB.");
  }
  async writeFile(path: string, content: string): Promise<void> {
    throw new Error("FileSystemAccessAdapter not implemented natively yet. Use IndexedDB.");
  }
  async deleteFile(path: string): Promise<void> {
    throw new Error("FileSystemAccessAdapter not implemented natively yet. Use IndexedDB.");
  }
  async listFiles(directory?: string): Promise<string[]> {
    throw new Error("FileSystemAccessAdapter not implemented natively yet. Use IndexedDB.");
  }
  async exists(path: string): Promise<boolean> {
    throw new Error("FileSystemAccessAdapter not implemented natively yet. Use IndexedDB.");
  }
  async createDirectory(path: string): Promise<void> {
    throw new Error("FileSystemAccessAdapter not implemented natively yet. Use IndexedDB.");
  }
}
