"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { AlignLeft, AlignCenter, Columns3, Copy, Trash2 } from "lucide-react";

export default function MultiSelectToolbar() {
  const selectedElements = useEditorStore((s) => s.selectedElements);
  const { activeBreakpoint } = useEditorStore();
  const updateComponentCSSOverride = useProjectStore(
    (s) => s.updateComponentCSSOverride,
  );
  const removeElement = useProjectStore((s) => s.removeComponent);
  const [copied, setCopied] = useState(false);

  if (selectedElements.length < 2) return null;

  const bulk = (prop: string, val: string) =>
    selectedElements.forEach((id) =>
      updateComponentCSSOverride(id, activeBreakpoint, prop, val),
    );

  const BTN =
    "flex items-center justify-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[9px] font-bold text-white/35 transition hover:border-white/15 hover:text-white/60";

  return (
    <div className="flex-shrink-0 border-b border-white/[0.06] bg-[#0E0E12] px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-400">
          {selectedElements.length} selected
        </span>
        <button
          onClick={() => {
            if (window.confirm(`Delete ${selectedElements.length} elements?`))
              selectedElements.forEach((id) => removeElement(id));
          }}
          className="flex h-5 items-center gap-1 rounded-md px-1.5 text-[8px] font-bold text-rose-400/60 transition hover:bg-rose-500/8 hover:text-rose-400"
        >
          <Trash2 className="h-2.5 w-2.5" /> Del
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => {
            bulk("display", "flex");
            bulk("flexDirection", "row");
            bulk("alignItems", "center");
          }}
          className={BTN}
          title="Flex Row"
        >
          <Columns3 className="h-3 w-3" />
          Row
        </button>
        <button
          onClick={() => {
            bulk("display", "flex");
            bulk("flexDirection", "column");
          }}
          className={BTN}
          title="Flex Column"
        >
          <Columns3 className="h-3 w-3 rotate-90" />
          Col
        </button>
        <button
          onClick={() => bulk("textAlign", "left")}
          className={BTN}
          title="Align left"
        >
          <AlignLeft className="h-3 w-3" />
        </button>
        <button
          onClick={() => bulk("textAlign", "center")}
          className={BTN}
          title="Align center"
        >
          <AlignCenter className="h-3 w-3" />
        </button>

        <button onClick={() => bulk("gap", "8px")} className={BTN}>
          G 8
        </button>
        <button onClick={() => bulk("gap", "16px")} className={BTN}>
          G 16
        </button>
        <button onClick={() => bulk("padding", "12px")} className={BTN}>
          P 12
        </button>
        <button onClick={() => bulk("padding", "24px")} className={BTN}>
          P 24
        </button>
      </div>
    </div>
  );
}
