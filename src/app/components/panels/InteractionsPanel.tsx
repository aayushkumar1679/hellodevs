"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export default function InteractionsPanel() {
  return (
    <div className="p-4 text-center text-gray-400 text-sm">
      <div className="flex flex-col items-center gap-2">
        <AlertCircle size={32} className="text-gray-500" />
        <p className="font-medium">Coming Soon</p>
        <p className="text-xs text-gray-500">
          Interactive animations and event handlers will be available in the
          next update
        </p>
      </div>
    </div>
  );
}
