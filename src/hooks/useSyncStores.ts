"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";
import { mergeProjectDesignElements } from "@/utils/projectModel";

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
  const replaceElements = useDesignStore((state) => state.replaceElements);
  const elements = useDesignStore((state) => state.elements);
  const syncCurrentProjectDesignElements = useCanvasStore(
    (state) => state.syncCurrentProjectDesignElements
  );
  const lastProjectIdRef = useRef<string | null>(null);
  const lastSerializedDesignRef = useRef("");

  useEffect(() => {
    if (!currentProject) {
      replaceElements({});
      lastProjectIdRef.current = null;
      lastSerializedDesignRef.current = "";
      return;
    }

    const normalizedDesign = mergeProjectDesignElements(
      currentProject,
      currentProject.designElements
    );
    const serializedProjectDesign = JSON.stringify(normalizedDesign);

    // CRITICAL: We only force-replace elements in useDesignStore if the PROJECT ID changes
    // or if the design store is empty (initial hydration).
    // If we replace on every currentProject change, we fight with the design store's own state.
    const isNewProject = lastProjectIdRef.current !== currentProject.id;
    const isDesignEmpty = Object.keys(elements).length === 0;

    if (isNewProject || isDesignEmpty) {
      lastProjectIdRef.current = currentProject.id;
      lastSerializedDesignRef.current = serializedProjectDesign;
      replaceElements(normalizedDesign);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, replaceElements]);

  useEffect(() => {
    if (!currentProject) {
      return;
    }

    const normalizedElements = mergeProjectDesignElements(currentProject, elements);
    const serializedElements = JSON.stringify(normalizedElements);

    if (serializedElements === lastSerializedDesignRef.current) {
      return;
    }

    lastSerializedDesignRef.current = serializedElements;
    syncCurrentProjectDesignElements(normalizedElements);
  }, [currentProject, elements, syncCurrentProjectDesignElements]);
}

export default useSyncStores;
