"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { Trash2 } from "lucide-react";
import ComponentRenderer from "./ComponentRenderer";

interface ComponentWrapperProps {
  component: any;
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
  const [draftText, setDraftText] = useState(component.props?.text ?? "");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Focus editor */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /* Sync text */
  useEffect(() => {
    setDraftText(component.props?.text ?? "");
  }, [component.props?.text]);

  const saveText = () => {
    if (draftText !== component.props?.text) {
      updateComponent(component.id, {
        props: { ...component.props, text: draftText },
      });
    }
    setIsEditing(false);
  };

  const cancelText = () => {
    setDraftText(component.props?.text ?? "");
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    if (isTextComponent) {
      setIsEditing(true);
    }
  };

  return (
    <div onDoubleClick={handleDoubleClick} className="relative">
      {/* Inline edit */}
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onBlur={saveText}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              saveText();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancelText();
            }
          }}
          className="w-full bg-transparent outline-none resize-none text-inherit font-inherit"
        />
      ) : (
        <ComponentRenderer component={component} />
      )}

      {/* Delete button (positioned, no layout impact) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeComponent(component.id);
        }}
        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition"
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
