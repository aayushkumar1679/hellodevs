"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { Trash2 } from "lucide-react";
import ComponentRenderer from "./ComponentRenderer";

interface ComponentWrapperProps {
  component: {
    id: string;
    type: string;
    props?: Record<string, any>;
    children?: string[];
  };
}

export default function ComponentWrapper({ component }: ComponentWrapperProps) {
  const { updateComponent, removeComponent, currentProject } = useCanvasStore();

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
    <div
      data-element-id={component.id}
      onDoubleClick={handleDoubleClick}
      className={`
        relative group
        rounded-sm
        transition-all
        ${
          isEditing
            ? "ring-1 ring-sky-400/60 bg-sky-50/60"
            : "hover:bg-slate-100/70"
        }
      `}
    >
      {/* Inline edit OR render */}
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
          className="
            w-full
            bg-transparent
            outline-none
            resize-none
            text-inherit
            font-inherit
            leading-relaxed
            caret-blue-500
            selection:bg-blue-200
            px-0.5
          "
        />
      ) : (
        <ComponentRenderer component={component} />
      )}

      {/* ✅ RENDER CHILDREN (CRITICAL — UNCHANGED LOGIC) */}
      {component.children &&
        component.children.length > 0 &&
        currentProject && (
          <div className="relative w-full pl-1 mt-0.5">
            {component.children.map((childId) => {
              const child = currentProject.components[childId];
              if (!child) return null;

              return <ComponentWrapper key={child.id} component={child} />;
            })}
          </div>
        )}

      {/* Delete button — IDE-style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeComponent(component.id);
        }}
        title="Delete component"
        className="
          absolute -top-2 -right-2
          p-1.5
          rounded-full
          bg-rose-500/95
          text-white
          opacity-0
          scale-90
          group-hover:opacity-100
          group-hover:scale-100
          transition-all
          shadow-[0_12px_20px_-12px_rgba(225,29,72,0.9)]
          hover:bg-rose-600
        "
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
