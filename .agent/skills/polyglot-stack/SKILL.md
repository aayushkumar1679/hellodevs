---
name: polyglot-stack
description: Use when working on the Polyglot IDE project. Contains the full
  stack reference, file conventions, TypeScript rules, and Next.js 15 patterns
  for this specific codebase.
---

# Polyglot Stack Reference

## Tech Stack
- Next.js 15 (App Router), TypeScript strict mode, React 19
- Zustand for all state management (stores in src/state/)
- Prisma ORM (schema at prisma/schema.prisma)
- Tailwind CSS for component styling
- NextAuth for authentication (config at src/lib/auth.ts)
- Monaco Editor (@monaco-editor/react) for the embedded code editor
- Vitest for unit testing (config at vitest.config.ts)
- @webcontainer/api for in-browser Node.js runtime
- xterm.js for the built-in terminal

## Project Structure
```
src/
  app/              ← Next.js App Router pages + API routes
  components/
    ide/            ← IDE chrome: IDEShell, ActivityBar, FileTree, CodeEditor etc.
    canvas/         ← Canvas: SmartGuides, AutoLayout, CanvasRulers, ResponsiveBar
    app/components/ ← Visual builder panels: AIPromptPanel, AssetsPanel etc.
  lib/
    agents/         ← designAgent, codeAgent, architectAgent, screenshotAgent
    codeSync/       ← canvasToCode.ts and codeToCanvas.ts
    virtualFS/      ← VFS engine, fileWatcher, IndexedDB adapter
    runtime/        ← webContainer.ts
  state/            ← Zustand stores: useEditorStore, useFileSystemStore, useAgentStore
  types/            ← TypeScript interfaces
  utils/            ← helpers, exporters, codeGenerator
prisma/schema.prisma
```

## TypeScript Rules
- NEVER use `any` type — always define proper interfaces
- Enable strict mode — tsconfig has strict: true
- Use @/ import alias for src/ directory
- Prefer `interface` over `type` for object shapes
- All API route handlers must have typed request/response

## Component Rules
- 'use client' ONLY when using browser APIs, hooks, or event handlers
- Prefer server components for data fetching
- New IDE chrome components go in src/components/ide/
- New canvas-specific components go in src/components/canvas/
- Library components (Hero, Navbar etc.) stay in src/app/components/library/

## CSS Rules
- ALL colors use CSS variables from globals.css (--bg-base, --accent etc.)
- No hardcoded hex values in component files except inside Monaco theme definitions
- No Tailwind color classes (bg-gray-900, text-white etc.) in IDE chrome
- Tailwind utility classes OK for layout (flex, grid, gap, padding)

## State Management
- Canvas element tree: useEditorStore.ts
- File system state: useFileSystemStore.ts
- Agent state: useAgentStore.ts
- Project data: useProjectStore.ts

## Build Verification
After every file change, run: npx tsc --noEmit
Before finishing any task, run: npm run build
Tests: npx vitest run
