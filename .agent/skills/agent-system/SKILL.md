---
name: agent-system
description: Use when building or modifying any AI agent mode — design agent,
  code agent, architect agent, screenshot agent, AgentManager UI,
  AgentArtifact renderer, useAgentStore, or /api/generate/agent route.
---

# Polyglot Agent System

## Overview
Polyglot runs AI agents that have VISUAL CONTEXT — they can see the canvas, not
just files. This is the core competitive advantage over Antigravity/Codex/Webflow.

## 4 Agent Modes

### 1. Design Agent (src/lib/agents/designAgent.ts)
- Input: selected CanvasElement[] + user prompt + design tokens
- Process: sends canvas tree to Claude with design system context
- Output: updated CanvasElement[] with improved styles/props + explanation
- Use case: "Make this hero section more modern"
- Returns artifact type: 'design' (before/after canvas preview)

### 2. Code Agent (src/lib/agents/codeAgent.ts)
- Input: file path + file content + user prompt
- Process: sends file to Claude with code instruction
- Output: updated file content + unified diff + explanation
- Use case: "Refactor this to use server actions"
- Returns artifact type: 'code' (Monaco diff view)

### 3. Architect Agent (src/lib/agents/architectAgent.ts)
- Input: feature description + project file structure + prisma schema
- Process: sends to Claude for full implementation planning
- Output: multi-step plan with file list per step
- Use case: "Add user authentication to this project"
- Returns artifact type: 'plan' (interactive checklist)

### 4. Screenshot Agent (src/lib/agents/screenshotAgent.ts)
- Input: image as base64 string
- Process: sends to existing /api/generate/vision route
- Output: CanvasElement[] reconstructed from the screenshot
- Use case: paste any UI screenshot → appears on canvas
- Returns artifact type: 'design' (canvas with reconstructed layout)

## Context Builder (src/lib/agents/contextBuilder.ts)
All agents call buildAgentContext() which assembles:
```typescript
interface AgentContext {
  canvasElements?: CanvasElement[];
  selectedElements?: CanvasElement[];
  activeFile?: string;
  fileContent?: string;
  designSystem?: DesignSystemTokens;
  prismaSchema?: string;
  projectFiles?: string[];  // file paths only, not content
}
```

## API Endpoint
All agents POST to: /api/generate/agent/route.ts
```typescript
// Request body
{
  mode: 'design' | 'code' | 'architect' | 'screenshot',
  systemPrompt: string,
  userMessage: string,
  context: AgentContext
}
// Response: JSON object specific to mode
```

## Agent Store (src/state/useAgentStore.ts)
```typescript
interface Agent {
  id: string;
  name: string;
  mode: 'design' | 'code' | 'architect' | 'screenshot';
  status: 'idle' | 'running' | 'done' | 'error';
  messages: Message[];
  artifacts: AgentArtifact[];
  task: string;
}
// Actions: createAgent, sendMessage, addArtifact, cancelAgent, removeAgent
```

## Artifact Types (src/components/ide/AgentArtifact.tsx)

### Plan Artifact
```typescript
{
  type: 'plan',
  title: string,
  steps: Array<{
    id: string, title: string, description: string,
    files: string[], status: 'pending'|'active'|'done'|'error'
  }>
}
```
Renders as: interactive checklist, step status icons, progress bar

### Code Artifact
```typescript
{
  type: 'code',
  filePath: string,
  before: string,   // original content
  after: string,    // updated content
  diff: string,     // unified diff
  explanation: string
}
```
Renders as: Monaco DiffEditor, Accept/Reject buttons

### Design Artifact
```typescript
{
  type: 'design',
  before: CanvasElement[],
  after: CanvasElement[],
  explanation: string,
  changes: string[]
}
```
Renders as: split before/after canvas preview, Accept/Reject buttons

## AgentManager Panel Behaviour
- Renders in the sidebar when 'agent' activity is active in ActivityBar
- Shows all running agents as cards
- Each card: mode badge + status dot + latest message + artifact thumbnails
- "New Agent" button opens mode selector (4 pills: Design/Code/Architect/Screenshot)
- On mode select: shows text input for the task description
- On submit: calls createAgent() in useAgentStore + sends first message
- Artifacts appear in-card and can be expanded to full view

## JSON Response Requirement
ALL agent API calls must return ONLY valid JSON — no markdown, no explanation
outside the JSON object. The response is parsed directly.
Use: JSON.parse(data.content[0].text) after stripping any ```json fences.
