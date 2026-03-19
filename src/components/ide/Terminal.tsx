import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Play, Square, Terminal as TerminalIcon, RefreshCw } from 'lucide-react';

interface TerminalProps {
  className?: string;
}

export default function Terminal({ className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#0a0a0c', // Matches our --bg-base
        foreground: '#a1a1aa',
        cursor: '#8b5cf6', // Violet
        selectionBackground: 'rgba(139, 92, 246, 0.3)'
      },
      fontFamily: 'JetBrains Mono, Menlo, monospace',
      fontSize: 11,
      cursorBlink: true
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\\x1b[35m[Polyglot OS]\\x1b[0m Terminal Ready. Awaiting WebContainer boot...');

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className={`flex flex-col h-full bg-[#0a0a0c] border border-[var(--border-subtle)] rounded-xl overflow-hidden ${className}`}>
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          <TerminalIcon className="w-3.5 h-3.5" />
          Terminal
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="p-1 hover:bg-white/5 rounded text-[var(--text-muted)] hover:text-white transition-colors"
            title="Clear Terminal"
            onClick={() => xtermRef.current?.clear()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {isRunning ? (
            <button 
              className="p-1 hover:bg-rose-500/20 rounded text-rose-400 transition-colors"
              title="Stop Server"
              onClick={() => setIsRunning(false)}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button 
              className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 transition-colors"
              title="Start Dev Server"
              onClick={() => {
                setIsRunning(true);
                xtermRef.current?.writeln('\\x1b[32m$ npm run dev\\x1b[0m');
                xtermRef.current?.writeln('Starting WebContainer dev server...');
                // Integration with startDevServer goes here
              }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>
      
      {/* Terminal Container */}
      <div className="flex-1 p-2 overflow-hidden relative">
        <div ref={terminalRef} className="w-full h-full absolute inset-0 pl-2 pt-2" />
      </div>
    </div>
  );
}
