"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';
import { Terminal as TerminalIcon, X, Trash2, Play, Square, ChevronDown } from 'lucide-react';
import { getWebContainer, startDevServer } from '@/lib/runtime/webContainer';
import { useWebContainerStore } from '@/state/useWebContainerStore';

interface TerminalProps {
  className?: string;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT_VH = 0.5;

export default function Terminal({ className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const serverProcessRef = useRef<{ kill: () => void } | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartH = useRef<number>(240);

  const [height, setHeight] = useState(240);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [serverRunning, setServerRunning] = useState(false);

  const { setDevServerUrl, setBooting, setServerRunning: setStoreServerRunning } = useWebContainerStore();

  /* ─── XTerm init ─── */
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#0a0a10',
        foreground: '#c0c0d8',
        cursor: '#7c6fff',
        cursorAccent: '#0a0a10',
        selectionBackground: 'rgba(124,111,255,0.25)',
        black: '#0a0a10',
        brightBlack: '#4a4a68',
        red: '#ff6b6b',
        brightRed: '#ff6b6b',
        green: '#69db7c',
        brightGreen: '#69db7c',
        yellow: '#ffa94d',
        brightYellow: '#ffa94d',
        blue: '#7c6fff',
        brightBlue: '#a09aff',
        magenta: '#c678dd',
        brightMagenta: '#c678dd',
        cyan: '#00e5b0',
        brightCyan: '#00e5b0',
        white: '#f0f0f8',
        brightWhite: '#ffffff',
      },
      fontFamily: '"DM Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 2000,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\x1b[38;2;124;111;255m╭─ Polyglot OS Terminal ─────────────────────────────╮\x1b[0m');
    term.writeln('\x1b[38;2;124;111;255m│\x1b[0m  Ready. Press \x1b[38;2;0;229;176mPlay\x1b[0m to boot WebContainer.           \x1b[38;2;124;111;255m│\x1b[0m');
    term.writeln('\x1b[38;2;124;111;255m╰────────────────────────────────────────────────────╯\x1b[0m');
    term.writeln('');

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => fitAddonRef.current?.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  /* ─── Refit when panel height changes ─── */
  useEffect(() => {
    const id = requestAnimationFrame(() => fitAddonRef.current?.fit());
    return () => cancelAnimationFrame(id);
  }, [height, isCollapsed]);

  /* ─── WebContainer start/stop ─── */
  const handleStart = useCallback(async () => {
    if (!xtermRef.current) return;
    const term = xtermRef.current;

    setServerRunning(true);
    setStoreServerRunning(true);
    setBooting(true);

    term.writeln('\x1b[38;2;0;229;176m$ npm run dev\x1b[0m');
    term.writeln('\x1b[38;2;152;152;184mBooting WebContainer…\x1b[0m');

    try {
      const wc = await getWebContainer();

      // listen for server-ready event
      wc.on('server-ready', (_port: number, url: string) => {
        setDevServerUrl(url);
        setBooting(false);
        term.writeln(`\n\x1b[38;2;105;219;124m✓ Dev server ready at ${url}\x1b[0m\n`);
      });

      const process = await startDevServer((data: string) => {
        term.write(data);
      });

      serverProcessRef.current = process as { kill: () => void };
    } catch (err) {
      setBooting(false);
      setServerRunning(false);
      setStoreServerRunning(false);
      term.writeln(`\n\x1b[38;2;255;107;107m✗ Failed to start: ${String(err)}\x1b[0m\n`);
    }
  }, [setDevServerUrl, setBooting, setStoreServerRunning]);

  const handleStop = useCallback(() => {
    serverProcessRef.current?.kill();
    serverProcessRef.current = null;
    setServerRunning(false);
    setStoreServerRunning(false);
    setDevServerUrl(null);
    xtermRef.current?.writeln('\n\x1b[38;2;255;107;107m● Server stopped\x1b[0m\n');
  }, [setDevServerUrl, setStoreServerRunning]);

  const handleClear = useCallback(() => {
    xtermRef.current?.clear();
  }, []);

  /* ─── Resize drag ─── */
  const onDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartH.current = height;

    const onMove = (ev: PointerEvent) => {
      if (dragStartY.current === null) return;
      const delta = dragStartY.current - ev.clientY;
      const maxH = Math.floor(window.innerHeight * MAX_HEIGHT_VH);
      setHeight(Math.max(MIN_HEIGHT, Math.min(maxH, dragStartH.current + delta)));
    };

    const onUp = () => {
      dragStartY.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [height]);

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        height: isCollapsed ? 34 : height,
        minHeight: isCollapsed ? 34 : MIN_HEIGHT,
        background: '#0a0a10',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        transition: 'height 120ms cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Drag handle */}
      {!isCollapsed && (
        <div
          onPointerDown={onDragStart}
          style={{
            height: 4,
            width: '100%',
            cursor: 'row-resize',
            flexShrink: 0,
            background: 'transparent',
          }}
          className="hover:bg-[var(--accent)] hover:opacity-40 transition-colors"
        />
      )}

      {/* Header */}
      <div
        style={{
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          background: '#0f0f18',
          borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        {/* Left: label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TerminalIcon size={12} color="var(--text-3, #4a4a68)" />
          <span style={{
            fontSize: 9,
            fontFamily: 'var(--font-ui, "DM Sans", system-ui)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--text-3, #4a4a68)',
            textTransform: 'uppercase',
          }}>
            Terminal
          </span>
          {serverRunning && (
            <span style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: '#69db7c',
              display: 'inline-block',
              animation: 'pulse 1.4s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Clear */}
          <button
            onClick={handleClear}
            title="Clear terminal"
            style={{
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4, border: 'none', background: 'transparent',
              cursor: 'pointer', color: 'var(--text-3, #4a4a68)',
            }}
            className="hover:bg-white/5 hover:!text-[var(--text-2)] transition-colors"
          >
            <Trash2 size={12} />
          </button>

          {/* Start / Stop */}
          {serverRunning ? (
            <button
              onClick={handleStop}
              title="Stop server"
              style={{
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4, border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--accent-3, #ff6b6b)',
              }}
              className="hover:bg-[#ff6b6b]/10 transition-colors"
            >
              <Square size={11} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              title="Start dev server"
              style={{
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4, border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--accent-5, #69db7c)',
              }}
              className="hover:bg-[#69db7c]/10 transition-colors"
            >
              <Play size={11} fill="currentColor" />
            </button>
          )}

          {/* Kill / close X */}
          <button
            onClick={() => setIsCollapsed(true)}
            title="Collapse terminal"
            style={{
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4, border: 'none', background: 'transparent',
              cursor: 'pointer', color: 'var(--text-3, #4a4a68)',
            }}
            className="hover:bg-white/5 hover:!text-[var(--text-2)] transition-colors"
          >
            <X size={12} />
          </button>

          {/* Expand when collapsed */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              title="Expand terminal"
              style={{
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4, border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--text-3, #4a4a68)',
              }}
              className="hover:bg-white/5 transition-colors"
            >
              <ChevronDown size={12} />
            </button>
          )}
        </div>
      </div>

      {/* XTerm container */}
      {!isCollapsed && (
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            padding: '4px 0 4px 4px',
            background: '#0a0a10',
          }}
        >
          <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
}
