import React from "react";

export default function CanvasRulers() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-4 border-b border-[var(--border-strong)] bg-[var(--bg-base)] text-[8px] text-[var(--text-muted)] flex items-end px-1 select-none">
        0px 100 200 ...
      </div>
      <div className="absolute top-0 bottom-0 left-0 w-4 border-r border-[var(--border-strong)] bg-[var(--bg-base)] text-[8px] text-[var(--text-muted)] flex flex-col items-center py-1 select-none" style={{ writingMode: "vertical-rl" }}>
        0px 100 200 ...
      </div>
    </>
  );
}
