"use client";

import React, { useState } from "react";
import { Folder, FolderOpen, FileText, FileCode, FileJson, Hash, ChevronRight, ChevronDown } from "lucide-react";
import { useFileSystemStore } from "@/state/useFileSystemStore";

interface FileTreeItemProps {
  name: string;
  path: string;
  isFolder: boolean;
  childrenItems?: React.ReactNode;
  level: number;
}

const getFileIcon = (name: string) => {
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return <FileCode className="h-3.5 w-3.5 text-blue-400" />;
  if (name.endsWith(".css")) return <Hash className="h-3.5 w-3.5 text-cyan-400" />;
  if (name.endsWith(".json")) return <FileJson className="h-3.5 w-3.5 text-yellow-400" />;
  return <FileText className="h-3.5 w-3.5 text-slate-400" />;
};

export default function FileTreeItem({ name, path, isFolder, childrenItems, level }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFile, openFile } = useFileSystemStore();
  const isActive = activeFile === path;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      openFile(path);
    }
  };

  return (
    <div className="select-none">
      <div 
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-colors ${isActive && !isFolder ? 'bg-[var(--accent-primary)]/20 text-white' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        style={{ paddingLeft: `${ level * 12 + 8}px` }}
      >
        <div className="flex h-4 w-4 items-center justify-center opacity-70">
          {isFolder ? (
            isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
          ) : (
            getFileIcon(name)
          )}
        </div>
        <span className="text-[12px] truncate">{name}</span>
      </div>
      
      {isFolder && isOpen && (
        <div className="flex flex-col">
          {childrenItems}
        </div>
      )}
    </div>
  );
}
