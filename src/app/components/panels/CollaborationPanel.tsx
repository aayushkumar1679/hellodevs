"use client";

import React, { useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";

export default function CollaborationPanel() {
  const { currentProjectId } = useCanvasStore();
  const [copied, setCopied] = useState(false);

  const shareLink = currentProjectId
    ? `${window.location.origin}/share/${currentProjectId}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = () => {
    const subject = "Check out my website design";
    const body = `I'd like to share my website design with you:\n\n${shareLink}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  };

  const handleShareTwitter = () => {
    const text = `Check out my website design built with CanvasBuilder! ${shareLink}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold text-sm mb-4">Share Project</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-600">
            Share Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 border rounded px-2 py-1 text-xs bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
            >
              {copied ? "✓" : "Copy"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleShareEmail}
            className="w-full px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 transition text-sm text-left"
          >
            📧 Share via Email
          </button>
          <button
            onClick={handleShareTwitter}
            className="w-full px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 transition text-sm text-left"
          >
            𝕏 Share on Twitter
          </button>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500 mb-2">Features:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ View-only access</li>
            <li>✓ Live preview</li>
            <li>✓ Shareable link</li>
            <li>✓ No login required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
