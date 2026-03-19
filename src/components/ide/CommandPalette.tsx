"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, File, Terminal, Code, Settings, Plus, Sparkles,
  FolderOpen, GitBranch, Zap, RotateCw, Monitor, LayoutGrid,
  Bot, Database, Share2
} from 'lucide-react';
import { useEditorStore } from '@/state/useEditorStore';

/* ─── Command Registry ─── */
type CommandGroup = 'File' | 'View' | 'Agent' | 'Git' | 'Run' | 'Preferences';

interface Command {
  id: string;
  icon: React.ElementType;
  label: string;
  group: CommandGroup;
  shortcut?: string[];
}

const COMMANDS: Command[] = [
  // File
  { id: 'new-file',       icon: Plus,       label: 'New File…',            group: 'File',        shortcut: ['Ctrl', 'N']       },
  { id: 'open-file',      icon: FolderOpen, label: 'Open File…',            group: 'File',        shortcut: ['Ctrl', 'O']       },
  { id: 'search-files',   icon: Search,     label: 'Search in Project',     group: 'File',        shortcut: ['Ctrl', 'Shift', 'F'] },
  // View
  { id: 'toggle-terminal', icon: Terminal,  label: 'Toggle Terminal',       group: 'View',        shortcut: ['Ctrl', '`']       },
  { id: 'view-code',      icon: Code,       label: 'View Source Code',      group: 'View',        shortcut: ['Ctrl', 'Shift', 'E'] },
  { id: 'view-canvas',    icon: LayoutGrid, label: 'Switch to Canvas',      group: 'View'                                       },
  { id: 'view-preview',   icon: Monitor,    label: 'Open Preview',          group: 'View',        shortcut: ['Ctrl', 'Shift', 'P'] },
  // Agent
  { id: 'ai-architect',   icon: Sparkles,   label: 'Ask AI Architect',      group: 'Agent',       shortcut: ['Ctrl', 'Shift', 'A'] },
  { id: 'ai-design',      icon: Bot,        label: 'AI Design Agent',       group: 'Agent'                                      },
  { id: 'screenshot-ai',  icon: Share2,     label: 'Screenshot → AI',       group: 'Agent'                                      },
  // Git
  { id: 'git-branch',     icon: GitBranch,  label: 'Checkout Branch…',      group: 'Git'                                        },
  // Run
  { id: 'run-dev',        icon: Zap,        label: 'Start Dev Server',      group: 'Run'                                        },
  { id: 'run-build',      icon: RotateCw,   label: 'Build Project',         group: 'Run'                                        },
  { id: 'inspect-db',     icon: Database,   label: 'Inspect Database',      group: 'Run'                                        },
  // Preferences
  { id: 'settings',       icon: Settings,   label: 'Open Settings',         group: 'Preferences', shortcut: ['Ctrl', ',']       },
  { id: 'new-project',    icon: File,       label: 'Create New Project',    group: 'Preferences'                                },
];

const GROUP_ORDER: CommandGroup[] = ['File', 'View', 'Agent', 'Git', 'Run', 'Preferences'];

export default function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [query, setQuery]       = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef                = useRef<HTMLInputElement>(null);
  const listRef                 = useRef<HTMLDivElement>(null);
  const { setViewMode }         = useEditorStore();

  /* ─── Global Ctrl+K toggle ─── */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  /* ─── Reset on open ─── */
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  /* ─── Filter results ─── */
  const filtered = query.length === 0
    ? COMMANDS.slice(0, 8)
    : COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  /* ─── Group the filtered results ─── */
  const grouped: { group: string; items: (Command & { flatIdx: number })[] }[] = [];
  let flatIdx = 0;
  for (const g of GROUP_ORDER) {
    const items = filtered
      .filter((c) => c.group === g)
      .map((c) => ({ ...c, flatIdx: flatIdx++ }));
    if (items.length) grouped.push({ group: g, items });
  }

  /* ─── Keyboard navigation ─── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[activeIdx];
      if (cmd) runCommand(cmd.id);
    }
  }, [filtered, activeIdx]);

  /* ─── Scroll active item into view ─── */
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  /* ─── Command executor ─── */
  const runCommand = (id: string) => {
    setOpen(false);
    switch (id) {
      case 'view-code':    setViewMode('code');    break;
      case 'view-canvas':  setViewMode('design');  break;
      case 'view-preview': setViewMode('preview'); break;
      default: break;
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        background: 'rgba(0,0,0,0.70)',
      }}
      onClick={() => setOpen(false)}
    >
      {/* Modal container */}
      <div
        style={{
          width: 560,
          maxHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#16161f',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
          animation: 'cpFadeIn 120ms cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* ── Search row ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          height: 44,
          gap: 8,
          borderBottom: '1px solid rgba(255,255,255,0.09)',
          flexShrink: 0,
        }}>
          <Search size={15} color="var(--text-3, #4a4a68)" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            placeholder="Type a command or search…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              fontFamily: 'var(--font-ui, "DM Sans", system-ui)',
              color: 'var(--text-1, #f0f0f8)',
            }}
          />
          {/* ⌘K badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {['Ctrl', 'K'].map((k) => (
              <kbd
                key={k}
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono, "DM Mono")',
                  color: 'var(--text-3, #4a4a68)',
                  background: 'var(--bg-overlay, #1c1c28)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 4,
                  padding: '1px 5px',
                  display: 'inline-block',
                }}
              >
                {k}
              </kbd>
            ))}
          </div>
        </div>

        {/* ── Results list ── */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 4px',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{
              padding: '24px 12px',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-3, #4a4a68)',
              fontFamily: 'var(--font-ui)',
            }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group}>
                {/* Group header */}
                <div style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-3, #4a4a68)',
                  padding: '8px 12px 4px',
                }}>
                  {group}
                </div>

                {/* Group items */}
                {items.map((cmd) => {
                  const active = cmd.flatIdx === activeIdx;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      data-active={active ? 'true' : undefined}
                      onClick={() => runCommand(cmd.id)}
                      onMouseEnter={() => setActiveIdx(cmd.flatIdx)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 12px',
                        height: 34,
                        border: 'none',
                        borderRadius: 6,
                        background: active ? 'var(--bg-overlay, #1c1c28)' : 'transparent',
                        borderLeft: active ? '2px solid var(--accent, #7c6fff)' : '2px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: active ? 'var(--text-1, #f0f0f8)' : 'var(--text-2, #9898b8)',
                        transition: 'background 80ms, border-color 80ms, color 80ms',
                      }}
                    >
                      <Icon size={14} style={{ flexShrink: 0, opacity: active ? 1 : 0.55 }} />
                      <span style={{
                        flex: 1,
                        fontSize: 13,
                        fontFamily: 'var(--font-ui, "DM Sans", system-ui)',
                      }}>
                        {cmd.label}
                      </span>
                      {/* Keyboard shortcut badges */}
                      {cmd.shortcut && (
                        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                          {cmd.shortcut.map((key, i) => (
                            <kbd
                              key={i}
                              style={{
                                fontSize: 10,
                                fontFamily: 'var(--font-mono, "DM Mono")',
                                color: 'var(--text-3, #4a4a68)',
                                background: 'var(--bg-overlay, #1c1c28)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: 4,
                                padding: '1px 5px',
                                display: 'inline-block',
                              }}
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-ui)', color: 'var(--text-3, #4a4a68)' }}>
            ↑↓ Navigate · Enter Select · Esc Close
          </span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-ui)', color: 'var(--text-3, #4a4a68)' }}>
            Polyglot IDE
          </span>
        </div>
      </div>

      <style>{`
        @keyframes cpFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
