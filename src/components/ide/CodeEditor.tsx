"use client";

import React, { useEffect, useState, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { syncCodeToCanvas } from "@/lib/codeSync/codeToCanvas";
import { X, FileCode, Hash, FileJson, FileText, CheckCircle2 } from "lucide-react";

const getFileIcon = (name: string) => {
  if (name.endsWith(".tsx") || name.endsWith(".ts")) return <FileCode className="h-3 w-3 text-blue-400" />;
  if (name.endsWith(".css")) return <Hash className="h-3 w-3 text-cyan-400" />;
  if (name.endsWith(".json")) return <FileJson className="h-3 w-3 text-yellow-400" />;
  return <FileText className="h-3 w-3 text-[var(--text-muted)]" />;
};

export default function CodeEditor() {
  const { openFiles, activeFile, files, closeFile, setActiveFile, writeFile } = useFileSystemStore();
  const monaco = useMonaco();
  
  const [localContent, setLocalContent] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const savingRef = useRef(false);

  useEffect(() => {
    if (activeFile && files[activeFile]) {
      setLocalContent(files[activeFile].content);
      setSyncStatus("idle");
    } else {
      setLocalContent("");
    }
  }, [activeFile, files]);

  // Debounced save to Virtual File System
  useEffect(() => {
    if (!activeFile || localContent === files[activeFile]?.content) return;
    
    const timer = setTimeout(() => {
      savingRef.current = true;
      setSyncStatus("syncing");
      
      writeFile(activeFile, localContent).then(() => {
        // Run bidirectional AST sync
        const success = syncCodeToCanvas(activeFile, localContent);
        setSyncStatus(success ? "synced" : "error");
        
        // Reset the "synced" status after a moment
        setTimeout(() => setSyncStatus("idle"), 2000);
      }).catch(() => {
        setSyncStatus("error");
      }).finally(() => {
        savingRef.current = false;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [localContent, activeFile, writeFile, files]);

  // Configure custom Monaco theme when monaco instance is ready
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('polyglot-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0a0a0f', // var(--bg-base)
          'editor.lineHighlightBackground': '#111118',
        }
      });
      monaco.editor.setTheme('polyglot-dark');
    }
  }, [monaco]);

  if (openFiles.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--bg-base)] text-[var(--text-muted)]">
        <div className="text-4xl mb-4 opacity-10"><FileCode className="h-12 w-12" /></div>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">No file is open</p>
        <p className="text-[10px] mt-1 uppercase tracking-widest">Select a file from the Explorer to start editing</p>
      </div>
    );
  }

  const activeLanguage = activeFile ? files[activeFile]?.language : "typescript";
  const monacoLanguage = (activeLanguage === "tsx" || activeLanguage === "ts") ? "typescript" : 
                         activeLanguage === "json" ? "json" :
                         activeLanguage === "css" ? "css" :
                         activeLanguage === "html" ? "html" : "javascript";

  return (
    <div className="flex h-full w-full flex-col bg-[var(--bg-base)] overflow-hidden">
      {/* Editor Tabs */}
      <div className="flex h-[36px] w-full flex-shrink-0 items-center overflow-x-auto no-scrollbar bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] select-none">
        {openFiles.map(path => {
          const isActive = activeFile === path;
          const fileName = path.split('/').pop() || path;
          const isDirty = isActive && localContent !== files[path]?.content;

          return (
            <div
              key={path}
              onClick={() => setActiveFile(path)}
              className={`group flex h-full min-w-[120px] max-w-[200px] cursor-pointer items-center justify-between gap-3 border-r border-[var(--border-subtle)] px-3 text-[11px] transition-colors ${
                isActive 
                  ? "bg-[var(--bg-base)] text-[var(--text-primary)] border-t-[2px] border-t-[var(--accent-primary)]" 
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border-t-[2px] border-t-transparent"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {getFileIcon(fileName)}
                <span className="truncate pt-0.5">{fileName}</span>
              </div>
              
              <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                {isDirty ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--text-primary)] group-hover:hidden" />
                ) : null}
                <button 
                  onClick={(e) => { e.stopPropagation(); closeFile(path); }}
                  className={`flex h-5 w-5 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-rose-400 transition-colors ${isDirty ? "hidden group-hover:flex" : ""}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monaco Instance */}
      <div className="flex-1 w-full h-full relative">
        {activeFile ? (
          <Editor
            height="100%"
            language={monacoLanguage}
            theme="polyglot-dark"
            value={localContent}
            onChange={(value: string | undefined) => setLocalContent(value || "")}
            options={{
              minimap: { enabled: true, scale: 0.75 },
              fontSize: 13,
              fontFamily: "'Geist Mono', 'DM Mono', monospace",
              wordWrap: "on",
              padding: { top: 16 },
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: "always",
              formatOnType: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
