---
name: ide-design
description: Use when designing or building ANY UI component for the Polyglot IDE.
  Contains the complete design system, visual language rules, and exact specs for
  every IDE chrome component. Load this for every visual task.
---

# Polyglot IDE Design System

## CORE PRINCIPLE — THIS IS SOFTWARE, NOT A WEBSITE
Every component must look and feel like VS Code / Linear / Figma.
Ask yourself: "Does this look like a native IDE or a SaaS web app?"

## NEVER DO (web app patterns):
- White cards with drop shadows
- border-radius > 8px on chrome elements
- Tailwind bg-white, bg-gray-50, text-gray-900
- Font sizes > 15px in UI panels
- Box shadows except on floating modals/dropdowns
- Colourful gradient banners in chrome areas
- Centre-aligned marketing text in panels

## ALWAYS DO (IDE software patterns):
- Near-black surfaces with hairline 1px borders
- Text hierarchy via opacity, not size jumps
- Icons as primary navigation (Lucide React, 14–16px)
- Status via coloured dots and inline chips
- Monospace font for paths, variables, code
- Hover = background shifts by ~2% opacity (subtle)
- Panel titles in ALL-CAPS 10px, spaced, dim

## CSS Variables (defined in globals.css — never hardcode these):
```css
--bg-void:    #060609   /* title bar, activity bar */
--bg-base:    #0a0a10   /* main app background */
--bg-surface: #0f0f18   /* panels, sidebars */
--bg-elevated:#16161f   /* cards, dropdowns, modals */
--bg-overlay: #1c1c28   /* hover states */
--bg-input:   #12121a   /* text inputs */

--border-dim:  rgba(255,255,255,0.05)  /* subtle dividers */
--border-soft: rgba(255,255,255,0.09)  /* default borders */
--border-mid:  rgba(255,255,255,0.14)  /* active/focus */

--accent:     #7c6fff   /* primary violet */
--accent-dim: rgba(124,111,255,0.15)
--accent-2:   #00e5b0   /* AI teal */
--accent-2-dim: rgba(0,229,176,0.12)
--accent-3:   #ff6b6b   /* error */
--accent-4:   #ffa94d   /* warning / dirty */
--accent-5:   #69db7c   /* success */

--text-1: #f0f0f8   /* primary */
--text-2: #9898b8   /* secondary */
--text-3: #4a4a68   /* muted/disabled */
--text-accent: #a09aff

--font-ui:   'DM Sans', system-ui, sans-serif
--font-head: 'Syne', system-ui, sans-serif
--font-mono: 'DM Mono', 'Fira Code', monospace
```

## IDE Chrome Sizing
- Title bar: 36px height
- Tab bar: 34px height
- Status bar: 24px height
- Activity bar: 44px width
- Sidebar: 240px width (default)
- Inspector: 256px width

## Active State Pattern (for all nav items)
```css
/* Selected file in tree, active activity bar icon, active tab */
background: var(--accent-dim);
border-left: 2px solid var(--accent);
border-radius: 0 4px 4px 0;  /* flat left, rounded right */
color: var(--text-1);
```

## Typography Scale
- 9px  → section labels (ALL CAPS, letter-spacing: 0.08em, --text-3)
- 10px → keyboard shortcut badges, status bar items
- 11px → dense UI (file names, property labels, tab names)
- 12px → body text in panels
- 13px → primary content
- 15px+ → ONLY for major headings, very sparingly

## Animations
- Duration: 120ms (fast) or 200ms (panel open)
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
- Properties: opacity + transform ONLY
- Pulsing AI indicator: 1.4s ease-in-out infinite opacity 1→0.3

## Icon Library
Use `lucide-react` exclusively. Never emoji in chrome UI.
Common icons:
- Folder, FolderOpen, File, FileCode
- ChevronRight, ChevronDown
- Search, Settings2, Bot, Image, Database, LayoutGrid
- GitBranch, AlertCircle, Zap, Monitor, Terminal
- Share2, Rocket, ExternalLink, RotateCw

## Component Quick Reference
- File type colours: .tsx = --accent, .ts = --accent-2, .css = #c678dd, .json = --accent-4
- Tab active indicator: 1.5px bottom border in --accent
- Dirty file: 5px orange dot (--accent-4) after filename
- AI working: pulse animation on --accent-2 dot
