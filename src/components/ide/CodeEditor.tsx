"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Editor, { type OnMount, type Monaco } from "@monaco-editor/react";
import type * as MonacoNS from "monaco-editor";
import debounce from "lodash.debounce";
import { FileCode } from "lucide-react";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { codeToCanvas } from "@/lib/codeSync/codeToCanvas";

// ── Helpers ────────────────────────────────────────────────────────────────

function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "tsx" || ext === "ts") return "typescript";
  if (ext === "jsx" || ext === "js") return "javascript";
  if (ext === "css" || ext === "scss") return "css";
  if (ext === "html") return "html";
  if (ext === "json") return "json";
  if (ext === "md") return "markdown";
  return "plaintext";
}

function registerPolyglotTheme(monaco: Monaco) {
  monaco.editor.defineTheme("polyglot-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment",        foreground: "4a4a68", fontStyle: "italic" },
      { token: "keyword",        foreground: "7c6fff" },
      { token: "string",         foreground: "69db7c" },
      { token: "number",         foreground: "ffa94d" },
      { token: "type",           foreground: "00e5b0" },
      { token: "class",          foreground: "00e5b0" },
      { token: "function",       foreground: "a09aff" },
      { token: "variable",       foreground: "f0f0f8" },
      { token: "constant",       foreground: "ff6b6b" },
      { token: "delimiter",      foreground: "9898b8" },
      { token: "operator",       foreground: "9898b8" },
      { token: "tag",            foreground: "7c6fff" },
      { token: "attribute.name", foreground: "00e5b0" },
      { token: "attribute.value",foreground: "69db7c" },
    ],
    colors: {
      // surfaces
      "editor.background":                   "#0a0a10",
      "editor.foreground":                   "#f0f0f8",
      "editor.lineHighlightBackground":      "#12121c",
      "editor.lineHighlightBorder":          "#00000000",
      "editor.selectionBackground":          "rgba(124,111,255,0.25)",
      "editor.inactiveSelectionBackground":  "rgba(124,111,255,0.12)",
      "editor.selectionHighlightBackground": "rgba(124,111,255,0.10)",
      "editor.findMatchBackground":          "rgba(255,169,77,0.35)",
      "editor.findMatchHighlightBackground": "rgba(255,169,77,0.15)",
      // gutter
      "editorLineNumber.foreground":         "#3a3a5a",
      "editorLineNumber.activeForeground":   "#7c6fff",
      "editorGutter.background":             "#0a0a10",
      // cursor
      "editorCursor.foreground":             "#7c6fff",
      // indent guides
      "editorIndentGuide.background1":        "#1c1c28",
      "editorIndentGuide.activeBackground1":  "#3a3a5a",
      // brackets
      "editorBracketMatch.background":       "rgba(124,111,255,0.15)",
      "editorBracketMatch.border":           "#7c6fff",
      // widgets
      "editorWidget.background":             "#0f0f18",
      "editorWidget.border":                 "rgba(255,255,255,0.09)",
      "editorHoverWidget.background":        "#16161f",
      "editorHoverWidget.border":            "rgba(255,255,255,0.09)",
      "editorSuggestWidget.background":      "#16161f",
      "editorSuggestWidget.border":          "rgba(255,255,255,0.09)",
      "editorSuggestWidget.selectedBackground": "rgba(124,111,255,0.20)",
      // scrollbar
      "scrollbarSlider.background":          "rgba(255,255,255,0.06)",
      "scrollbarSlider.hoverBackground":     "rgba(255,255,255,0.10)",
      "scrollbarSlider.activeBackground":    "rgba(124,111,255,0.30)",
      // misc
      "editorError.foreground":              "#ff6b6b",
      "editorWarning.foreground":            "#ffa94d",
      "editorInfo.foreground":               "#00e5b0",
    },
  });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CodeEditor() {
  const { openFiles, activeFile, files, writeFile } = useFileSystemStore();
  const editorRef = useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Debounced VFS write (500ms) ─ stable across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedWrite = useCallback(
    debounce(async (path: string, content: string) => {
      await writeFile(path, content);
      // codeToCanvas is side-effect free; result is used by callers that need it
      codeToCanvas(content);
    }, 500),
    [writeFile],
  );

  // Sync editor model when activeFile changes
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !activeFile) return;

    const newContent = files[activeFile]?.content ?? "";
    const model = editor.getModel();

    // Only push if value actually differs (avoid cursor reset)
    if (model && model.getValue() !== newContent) {
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: newContent }],
        () => null,
      );
    }
  }, [activeFile, files]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register and apply the polyglot-dark theme
    registerPolyglotTheme(monaco);
    monaco.editor.setTheme("polyglot-dark");

    // Cmd+S / Ctrl+S → immediate VFS write
    editor.addAction({
      id: "polyglot.save",
      label: "Save File",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      ],
      run: () => {
        const path = useFileSystemStore.getState().activeFile;
        if (!path) return;
        const content = editor.getValue();
        void writeFile(path, content);
        codeToCanvas(content);
      },
    });

    // Debounced auto-save on every keystroke
    editor.onDidChangeModelContent(() => {
      const path = useFileSystemStore.getState().activeFile;
      if (!path) return;
      debouncedWrite(path, editor.getValue());
    });
  };

  // Empty state
  if (openFiles.length === 0 || !activeFile) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        style={{ background: "var(--bg-base)", color: "var(--text-3)" }}
      >
        <FileCode
          className="mb-3 opacity-20"
          style={{ width: 40, height: 40, color: "var(--accent)" }}
        />
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>No file open</p>
        <p
          style={{
            fontSize: 10,
            color: "var(--text-3)",
            marginTop: 4,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Select a file from the Explorer
        </p>
      </div>
    );
  }

  const language = detectLanguage(activeFile);
  const initialValue = files[activeFile]?.content ?? "";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <Editor
        key={activeFile}          /* remount when file changes to get new model */
        height="100%"
        language={language}
        theme="polyglot-dark"
        defaultValue={initialValue}
        onMount={handleMount}
        options={{
          fontSize: 13,
          fontFamily: "'DM Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          minimap: { enabled: false },
          padding: { top: 16, bottom: 16 },
          wordWrap: "on",
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: "always",
          formatOnType: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderWhitespace: "selection",
          tabSize: 2,
          scrollbar: {
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 4,
          },
        }}
      />
    </div>
  );
}
