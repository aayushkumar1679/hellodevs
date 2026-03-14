"use client";

import React, { useRef, useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { Trash2 } from "lucide-react";
import ComponentRenderer from "./ComponentRenderer";

interface ComponentWrapperProps {
  component: {
    id: string;
    type: string;
    props?: Record<string, unknown>;
  };
}

export default function ComponentWrapper({ component }: ComponentWrapperProps) {
  const { updateComponent, removeComponent } = useCanvasStore();

  const isTextComponent =
    component.type === "text" ||
    component.type === "heading" ||
    component.type === "button" ||
    component.type === "badge" ||
    component.type === "alert";

  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(String(component.props?.text ?? ""));

  const inputRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveText = () => {
    if (draftText !== component.props?.text) {
      updateComponent(component.id, {
        props: { ...component.props, text: draftText },
      });
    }
    setIsEditing(false);
  };

  const cancelText = () => {
    setDraftText(String(component.props?.text ?? ""));
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    if (isTextComponent) {
      setDraftText(String(component.props?.text ?? ""));
      setIsEditing(true);
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`relative group rounded-sm transition-all ${
        isEditing ? "ring-1 ring-sky-400/60" : ""
      }`}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={draftText}
          onChange={(event) => setDraftText(event.target.value)}
          onBlur={saveText}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              saveText();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancelText();
            }
          }}
          className="w-full resize-none bg-transparent px-0.5 text-inherit caret-blue-500 outline-none selection:bg-blue-200"
        />
      ) : (
        <ComponentRenderer component={component} />
      )}

      <button
        onClick={(event) => {
          event.stopPropagation();
          removeComponent(component.id);
        }}
        title="Delete component"
        className="absolute -top-2 -right-2 z-50 rounded-full bg-rose-500/95 p-1.5 text-white opacity-0 scale-90 shadow-[0_12px_20px_-12px_rgba(225,29,72,0.9)] transition-all group-hover:opacity-100 group-hover:scale-100 hover:bg-rose-600"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
