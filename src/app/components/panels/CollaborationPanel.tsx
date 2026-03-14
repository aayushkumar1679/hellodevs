"use client";

import React, { useState } from "react";
import { Copy, Check, Mail, Share2, ExternalLink } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";

export default function CollaborationPanel() {
  const { currentProjectId } = useProjectStore();
  const [copied, setCopied] = useState(false);

  const shareLink = currentProjectId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${currentProjectId}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 text-white">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
          Share
        </p>
        <p className="mt-0.5 text-[10px] text-white/40">
          Share a read-only live preview of this project
        </p>
      </div>

      {/* Share link */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
        <p className="mb-1.5 text-[8px] font-black uppercase tracking-wider text-white/20">
          Public Link
        </p>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 py-1.5">
            <p className="truncate font-mono text-[9px] text-white/30">
              {shareLink || "No project"}
            </p>
          </div>
          <button
            onClick={handleCopy}
            disabled={!shareLink}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/30 transition hover:border-white/15 hover:text-white/60 disabled:opacity-30"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Share actions */}
      <div className="space-y-1">
        {[
          {
            icon: Mail,
            label: "Share via Email",
            onClick: () => {
              const body = `I'd like to share my website design:\n\n${shareLink}`;
              window.open(
                `mailto:?subject=Check out my design&body=${encodeURIComponent(body)}`,
              );
            },
          },
          {
            icon: Share2,
            label: "Share on Twitter",
            onClick: () => {
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Built with Polyglot! ${shareLink}`)}`,
              );
            },
          },
          {
            icon: ExternalLink,
            label: "Open Preview",
            onClick: () => {
              if (shareLink) window.open(shareLink, "_blank");
            },
          },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={!shareLink}
            className="flex w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-left text-[10px] font-medium text-white/40 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white/60 disabled:opacity-30"
          >
            <Icon className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.05] px-2.5 py-2 text-[9px] text-white/20 space-y-0.5">
        {["View-only access", "Live preview", "No login required"].map((f) => (
          <p key={f}>✓ {f}</p>
        ))}
      </div>
    </div>
  );
}
