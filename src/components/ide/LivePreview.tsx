import React, { useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';

export default function LivePreview({ url = '' }: { url?: string }) {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[var(--bg-base)] text-[var(--text-muted)] p-6 text-center">
        <div className="w-12 h-12 mb-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg">
          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
        </div>
        <h3 className="text-sm font-bold text-white mb-2">Dev Server Starting</h3>
        <p className="text-xs max-w-xs leading-relaxed">
          Waiting for WebContainer to bind to a preview URL. Start the server from the Terminal to see live changes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-base)]">
      {/* Browser Chrome */}
      <div className="flex items-center gap-3 px-3 h-10 flex-shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 max-w-sm w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] truncate flex-1">{url}</span>
            <button 
              onClick={() => setKey(k => k + 1)}
              className="hover:text-white transition-colors text-[var(--text-muted)]"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button className="text-[var(--text-muted)] hover:text-white transition-colors p-1">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Frame */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        )}
        <iframe
          key={key}
          src={url}
          className="w-full h-full border-none"
          title="Live Preview"
          onLoad={() => setLoading(false)}
          allow="cross-origin-isolated"
        />
      </div>
    </div>
  );
}
