"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { useWebContainerStore } from '@/state/useWebContainerStore';

type DevicePreset = {
  id: string;
  label: string;
  width: number;
  icon: React.ElementType;
};

const DEVICES: DevicePreset[] = [
  { id: 'phone',   label: 'Phone',   width: 390,  icon: Smartphone },
  { id: 'tablet',  label: 'Tablet',  width: 768,  icon: Tablet    },
  { id: 'desktop', label: 'Desktop', width: 1280, icon: Monitor   },
];

interface ConsoleMessage {
  id: number;
  level: 'log' | 'warn' | 'error';
  text: string;
}

let _msgId = 0;

export default function LivePreview() {
  const devServerUrl = useWebContainerStore((s) => s.devServerUrl);
  const booting      = useWebContainerStore((s) => s.booting);

  const [device, setDevice]             = useState<DevicePreset>(DEVICES[2]);
  const [iframeKey, setIframeKey]       = useState(0);
  const [loading, setLoading]           = useState(false);
  const [consoleOpen, setConsoleOpen]   = useState(false);
  const [messages, setMessages]         = useState<ConsoleMessage[]>([]);
  const iframeRef                       = useRef<HTMLIFrameElement>(null);

  /* ─── Capture postMessage console events from iframe ─── */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const { type, args } = e.data ?? {};
      if (!type || !['log', 'warn', 'error'].includes(type)) return;
      const text = (args as unknown[]).map(String).join(' ');
      setMessages((prev) => [
        ...prev.slice(-200),
        { id: ++_msgId, level: type as ConsoleMessage['level'], text },
      ]);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const clearConsole = useCallback(() => setMessages([]), []);

  /* ─── Empty / booting state ─── */
  if (!devServerUrl) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'var(--bg-base, #0a0a10)',
        gap: 16,
      }}>
        <div style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8,
          background: 'var(--bg-elevated, #16161f)',
          border: '1px solid var(--border-soft, rgba(255,255,255,0.09))',
        }}>
          {booting
            ? <Loader2 size={18} color="var(--accent, #7c6fff)" style={{ animation: 'spin 1s linear infinite' }} />
            : <Monitor size={18} color="var(--text-3, #4a4a68)" />
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-1, #f0f0f8)', fontFamily: 'var(--font-ui)', margin: '0 0 4px' }}>
            {booting ? 'Booting WebContainer…' : 'Preview not started'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3, #4a4a68)', fontFamily: 'var(--font-ui)', margin: 0 }}>
            {booting ? 'Installing dependencies & starting server' : 'Start the dev server from the Terminal panel'}
          </p>
        </div>
      </div>
    );
  }

  const isDesktop = device.id === 'desktop';
  const levelColor: Record<ConsoleMessage['level'], string> = {
    log: 'var(--text-2, #9898b8)',
    warn: 'var(--accent-4, #ffa94d)',
    error: 'var(--accent-3, #ff6b6b)',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-base, #0a0a10)',
      overflow: 'hidden',
    }}>
      {/* ── Device selector bar ── */}
      <div style={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 8px',
        borderBottom: '1px solid var(--border-dim, rgba(255,255,255,0.05))',
        background: 'var(--bg-surface, #0f0f18)',
        flexShrink: 0,
      }}>
        {DEVICES.map((d) => {
          const active = d.id === device.id;
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              onClick={() => { setDevice(d); setLoading(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                height: 22,
                padding: '0 8px',
                borderRadius: 5,
                border: active ? '1px solid var(--accent, #7c6fff)' : '1px solid transparent',
                background: active ? 'var(--accent-dim, rgba(124,111,255,0.15))' : 'transparent',
                color: active ? 'var(--text-accent, #a09aff)' : 'var(--text-3, #4a4a68)',
                fontSize: 11,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                transition: 'all 120ms cubic-bezier(0.16,1,0.3,1)',
              }}
              className="hover:!text-[var(--text-2)] hover:!bg-[var(--bg-overlay)]"
            >
              <Icon size={12} />
              {d.label}
            </button>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Open in new tab */}
        <a
          href={devServerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new tab"
          style={{
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, color: 'var(--text-3, #4a4a68)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            textDecoration: 'none',
          }}
          className="hover:text-[var(--text-2)] hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* ── URL bar ── */}
      <div style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 6,
        borderBottom: '1px solid var(--border-dim, rgba(255,255,255,0.05))',
        background: 'var(--bg-surface, #0f0f18)',
        flexShrink: 0,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#69db7c',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        <span style={{
          flex: 1,
          fontSize: 11,
          fontFamily: 'var(--font-mono, "DM Mono", monospace)',
          color: 'var(--text-2, #9898b8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {devServerUrl}
        </span>
        <button
          onClick={refresh}
          title="Refresh"
          style={{
            width: 22, height: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, border: 'none', background: 'transparent',
            cursor: 'pointer', color: 'var(--text-3, #4a4a68)',
          }}
          className="hover:bg-white/5 hover:!text-[var(--text-2)] transition-colors"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* ── Iframe area ── */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: isDesktop ? 0 : 16,
        background: isDesktop ? 'white' : 'var(--bg-base, #0a0a10)',
      }}>
        <div style={{
          width: isDesktop ? '100%' : device.width,
          height: '100%',
          minHeight: isDesktop ? '100%' : '70vh',
          position: 'relative',
          borderRadius: isDesktop ? 0 : 24,
          overflow: 'hidden',
          border: isDesktop ? 'none' : '1px solid var(--border-soft, rgba(255,255,255,0.09))',
          transition: 'width 300ms cubic-bezier(0.16,1,0.3,1)',
          flexShrink: 0,
          background: 'white',
        }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'white', zIndex: 10,
            }}>
              <Loader2 size={24} color="#7c6fff" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          <iframe
            ref={iframeRef}
            key={`${iframeKey}-${device.id}`}
            src={devServerUrl}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            title="Live Preview"
            onLoad={() => setLoading(false)}
            allow="cross-origin-isolated"
          />
        </div>
      </div>

      {/* ── Console panel ── */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid var(--border-dim, rgba(255,255,255,0.05))',
        background: 'var(--bg-surface, #0f0f18)',
        overflow: 'hidden',
        height: consoleOpen ? 120 : 28,
        transition: 'height 200ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Console header */}
        <div style={{
          height: 28,
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: 6,
          cursor: 'pointer',
        }}
          onClick={() => setConsoleOpen((o) => !o)}
        >
          <span style={{
            fontSize: 9,
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--text-3, #4a4a68)',
            textTransform: 'uppercase',
          }}>
            Console
          </span>
          {messages.length > 0 && (
            <span style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-3)',
              background: 'var(--bg-overlay, #1c1c28)',
              borderRadius: 3,
              padding: '1px 4px',
            }}>
              {messages.length}
            </span>
          )}
          <div style={{ flex: 1 }} />
          {consoleOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); clearConsole(); }}
              title="Clear console"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: 3,
                border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--text-3)',
              }}
            >
              <XCircle size={11} />
            </button>
          )}
          {consoleOpen
            ? <ChevronDown size={12} color="var(--text-3, #4a4a68)" />
            : <ChevronUp size={12} color="var(--text-3, #4a4a68)" />
          }
        </div>

        {/* Console messages */}
        {consoleOpen && (
          <div style={{
            height: 92,
            overflow: 'auto',
            padding: '2px 8px',
          }}>
            {messages.length === 0 ? (
              <p style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-3, #4a4a68)',
                margin: '8px 0',
              }}>
                No console output
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono, "DM Mono", monospace)',
                  color: levelColor[m.level],
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {m.text}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
