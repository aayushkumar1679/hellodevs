"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";

/**
 * Hook that syncs canvas components to design store on mount
 * Fixes the "Element not found" error after page reload
 *
 * Problem: When page reloads, canvas store restores from localStorage,
 * but design store is empty, causing CanvasElement to fail.
 *
 * Solution: This hook copies all canvas components to design store
 * when the component first mounts.
 */
export function useSyncStores() {
  useEffect(() => {
    // Get current state from both stores
    const canvasState = useCanvasStore.getState();
    const designState = useDesignStore.getState();

    // If there's a current project in canvas store
    if (canvasState.currentProject) {
      // For each component in the canvas store
      Object.values(canvasState.currentProject.components).forEach(
        (component) => {
          // Check if it already exists in design store
          if (!designState.elements[component.id]) {
            // If not, add it (initializes with empty cssProperties)
            designState.addElement(component.id, component.type);
          }
        }
      );
    }
  }, []); // Empty dependency array = run once on mount
}

export default useSyncStores;
