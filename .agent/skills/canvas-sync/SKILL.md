---
name: canvas-sync
description: Use when working on canvas-to-code sync, virtual file system (VFS),
  Monaco editor integration, bidirectional canvas/code updates, fileWatcher,
  or the codeSync pipeline.
---

# Canvas ↔ Code Sync Architecture

## The Big Picture
Polyglot's killer feature is bidirectional sync:
- Drag element on canvas → generates real .tsx code
- Edit code in Monaco → updates canvas elements
No other IDE does this. Don't break it.

## The Full Loop
```
[Canvas drag] → canvasToCode() → VFS.writeFile() → fileWatcher.emit()
                                                          ↓
[Monaco tab]  ← refreshMonacoContent() ←────────────────┘

[Monaco save] → codeToCanvas() → parse JSX → useEditorStore.setTree()
                                                    ↓
[Canvas]      ← re-render ←────────────────────────┘
```

## Key Files and Their Roles
```
src/lib/codeSync/canvasToCode.ts
  - Input:  CanvasElement[]  + fileName: string
  - Output: string (valid .tsx file content)
  - Called: when canvas element tree changes

src/lib/codeSync/codeToCanvas.ts
  - Input:  tsx source string
  - Output: CanvasElement[]
  - Called: when Monaco content is saved (Cmd+S)

src/lib/virtualFS/index.ts
  - VirtualFileSystem class
  - writeFile(path, content) → calls fileWatcher.emit(path, content)
  - readFile(path) → returns string
  - listFiles(dir?) → returns string[]

src/lib/virtualFS/fileWatcher.ts
  - FileWatcher singleton (export const fileWatcher)
  - watch(path, cb) → () => void  (returns unwatch fn)
  - watchAll(cb) → () => void
  - emit(path, content) → notifies all watchers

src/state/useFileSystemStore.ts
  - openFiles: string[]
  - activeFile: string | null
  - writeFile(path, content) → calls vfs.writeFile() + fileWatcher.emit()
  - bootstrapProject(project) → seeds VFS from project data
```

## CanvasElement Interface
```typescript
interface CanvasElement {
  id: string;
  type: string;  // 'Hero' | 'Navbar' | 'Button' | 'Container' etc.
  props: Record<string, unknown>;
  styles: Record<string, string>;  // camelCase CSS (backgroundColor, not background-color)
  children: CanvasElement[];
  codeRepresentation?: {
    componentName: string;
    filePath: string;
    tailwindClasses: string[];
  };
}
```

## canvasToCode Output Format
```tsx
'use client';
import { Hero, Navbar } from '@/app/components/library';

export default function PageName() {
  return (
    <div className="relative w-full">
      <Navbar logo="Site" variant="dark" />
      <Hero title="Hello" subtitle="World" />
    </div>
  );
}
```

## codeToCanvas Notes
- Uses lightweight regex-based JSX parser (no Babel needed for basic cases)
- Parses component type, props, and nesting
- On parse failure: returns empty array (never crashes canvas)
- Runs debounced 300ms after Monaco content changes

## VFS Bootstrap (for new/loaded projects)
When a project loads, bootstrapProject() seeds VFS with:
- src/app/page.tsx (generated from canvas via canvasToCode)
- src/app/layout.tsx (standard Next.js layout)
- src/app/globals.css (from existing globals)
- package.json, tsconfig.json

## Wiring Checklist
- [ ] fileWatcher.ts exists and exports `fileWatcher` singleton
- [ ] useFileSystemStore.writeFile calls fileWatcher.emit
- [ ] CodeEditor.tsx onMount registers Cmd+S to call canvasToCode + vfs.writeFile
- [ ] Canvas.tsx subscribes to useEditorStore changes and calls canvasToCode
- [ ] CodeEditor.tsx listens to fileWatcher for external VFS changes to refresh
