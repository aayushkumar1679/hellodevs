import React, { useState, useEffect } from 'react';
import { Search, File, Terminal, Code, Settings, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/state/useEditorStore';

const COMMANDS = [
  { id: 'new-file', icon: Plus, label: 'New File...', category: 'File' },
  { id: 'search-files', icon: Search, label: 'Search Files', category: 'File' },
  { id: 'toggle-terminal', icon: Terminal, label: 'Toggle Terminal', category: 'View' },
  { id: 'view-code', icon: Code, label: 'View Source Code', category: 'View' },
  { id: 'ai-architect', icon: Sparkles, label: 'Ask AI Architect', category: 'Agent' },
  { id: 'settings', icon: Settings, label: 'Open Settings', category: 'Preferences' }
];

export default function CommandPalette({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  const [query, setQuery] = useState('');
  const { setViewMode } = useEditorStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const filtered = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const executeCommand = (id: string) => {
    setOpen(false);
    switch(id) {
      case 'view-code':
        setViewMode('code');
        break;
      case 'toggle-terminal':
        // Optional dispatch to IDE Shell
        break;
      case 'ai-architect':
        // Switch left panel to agent
        break;
      default:
        break;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-[var(--border-subtle)]"
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)]">
              <Search className="w-5 h-5 text-[var(--text-muted)] mr-3" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <div className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono">
                ESC
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                  No results found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd.id)}
                      className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent-primary)] transition-colors text-left"
                    >
                      <cmd.icon className="w-4 h-4 mr-3 opacity-60" />
                      {cmd.label}
                      <span className="ml-auto text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
                        {cmd.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px] text-[var(--text-muted)] flex justify-between">
              <span>Navigate with arrows, Enter to select</span>
              <span>Polyglot IDE</span>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
