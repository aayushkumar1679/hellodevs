"use client";

import React, { useRef, useState, useMemo } from "react";
import { useProjectStore } from "@/state/useProjectStore";
import { Trash2 } from "lucide-react";
import ComponentRenderer from "./ComponentRenderer";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS } from "@/config/animationPresets";

interface ComponentWrapperProps {
  component: {
    id: string;
    type: string;
    props?: Record<string, unknown>;
  };
}

export default function ComponentWrapper({ component }: ComponentWrapperProps) {
  const { updateComponent, removeComponent } = useProjectStore();
  const comp = useProjectStore((s) => s.currentProject?.components[component.id]);

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
    const isTextComponent =
      component.type === "text" ||
      component.type === "heading" ||
      component.type === "button" ||
      component.type === "badge" ||
      component.type === "alert";
    if (isTextComponent) {
      setDraftText(String(component.props?.text ?? ""));
      setIsEditing(true);
    }
  };

  // Build motion props based on component animations
  const motionProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = {};
    if (comp?.animations && Array.isArray(comp.animations) && comp.animations.length > 0) {
      comp.animations.forEach((anim) => {
        const preset = ANIMATION_PRESETS[anim.preset];
        if (!preset) return;

        if (anim.trigger === "load" || anim.trigger === "scroll") {
          props.initial = { ...(props.initial || {}), ...preset.variants.hidden };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const target: any = { ...preset.variants.visible };
          
          if (anim.delay || anim.duration) {
            target.transition = { ...(target.transition || {}) };
            if (anim.delay) target.transition.delay = anim.delay;
            if (anim.duration) target.transition.duration = anim.duration;
          }

          if (anim.trigger === "scroll") {
            props.whileInView = { ...(props.whileInView || {}), ...target };
            props.viewport = { once: !anim.repeat, margin: "-50px" };
          } else {
            props.animate = { ...(props.animate || {}), ...target };
          }
        } else if (anim.trigger === "hover" && preset.variants.hover) {
          props.whileHover = { ...(props.whileHover || {}), ...preset.variants.hover };
        } else if (anim.trigger === "tap" && preset.variants.tap) {
          props.whileTap = { ...(props.whileTap || {}), ...preset.variants.tap };
        }
      });
    }
    return props;
  }, [comp?.animations]);

  return (
    <motion.div
      {...motionProps}
      onDoubleClick={handleDoubleClick}
      className={`relative group rounded-sm transition-all h-full w-full ${
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
    </motion.div>
  );
}
