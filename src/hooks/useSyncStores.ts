"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";

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
  const currentProject = useCanvasStore((state) => state.currentProject);
  const addElement = useDesignStore((state) => state.addElement);

  useEffect(() => {
    const designState = useDesignStore.getState();

    if (!currentProject) {
      return;
    }

    Object.values(currentProject.components).forEach((component) => {
      if (!designState.elements[component.id]) {
        const definition = COMPONENT_LIBRARY.find(
          (item) => item.type === component.type
        );

        addElement(
          component.id,
          component.type,
          definition?.defaultCss ? { ...definition.defaultCss } : {}
        );
      }
    });
  }, [addElement, currentProject]);
}

export default useSyncStores;
