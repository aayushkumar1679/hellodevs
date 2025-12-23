"use client";

import React from "react";
import { useBuilderStore, BuilderNode } from "@/state/useBuilderStore";
import clsx from "clsx";

export default function CanvasRenderer() {
  const project = useBuilderStore((s) => s.project);
  const selectedIds = useBuilderStore((s) => s.selectedIds);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const toggleSelect = useBuilderStore((s) => s.toggleSelect);
  const deselectAll = useBuilderStore((s) => s.deselectAll);

  if (!project) return null;

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deselectAll();
  };

  return (
    <div
      className="relative min-h-[600px] w-full"
      style={project.canvasCss}
      onClick={handleCanvasClick}
    >
      {project.rootIds.map((id) => (
        <NodeRenderer key={id} nodeId={id} />
      ))}
    </div>
  );
}

/* --------------------------------------------- */
/* Node Renderer (Recursive) */
/* --------------------------------------------- */

function NodeRenderer({ nodeId }: { nodeId: string }) {
  const node = useBuilderStore((s) => s.project?.nodes[nodeId]);
  const selectedIds = useBuilderStore((s) => s.selectedIds);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const toggleSelect = useBuilderStore((s) => s.toggleSelect);

  if (!node) return null;
  if (node.meta?.hidden) return null;

  const isSelected = selectedIds.includes(node.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey) {
      toggleSelect(node.id);
    } else {
      selectNode(node.id);
    }
  };

  const commonProps = {
    onClick: handleClick,
    style: node.css,
    className: clsx(
      "relative",
      isSelected && "outline outline-2 outline-blue-500 outline-offset-[-2px]"
    ),
  };

  /* ---------- Render by type ---------- */

  switch (node.type) {
    case "text":
      return <span {...commonProps}>{node.props?.text ?? "Text"}</span>;

    case "image":
      return (
        <img
          {...commonProps}
          src={node.props?.src || "https://via.placeholder.com/150"}
          alt=""
          draggable={false}
        />
      );

    case "button":
      return <button {...commonProps}>{node.props?.text || "Button"}</button>;

    case "group":
    case "div":
    default:
      return (
        <div {...commonProps}>
          {node.children.map((childId) => (
            <NodeRenderer key={childId} nodeId={childId} />
          ))}
        </div>
      );
  }
}
