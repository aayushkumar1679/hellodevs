"use client";

import React from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCanvasStore, CanvasComponent } from "@/state/useCanvasStore";
import ComponentWrapper from "./ComponentWrapper";

export default function Canvas() {
  const { componentTree, setTree } = useCanvasStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = componentTree.findIndex((c) => c.id === String(active.id));
    const newIndex = componentTree.findIndex((c) => c.id === String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;

    const newTree = [...componentTree];
    const [moved] = newTree.splice(oldIndex, 1);
    newTree.splice(newIndex, 0, moved);

    setTree(newTree);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={componentTree.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4 w-full">
          {componentTree.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>Drag components from the library to start building</p>
            </div>
          )}
          {componentTree.map((component) => (
            <ComponentWrapper key={component.id} component={component} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
