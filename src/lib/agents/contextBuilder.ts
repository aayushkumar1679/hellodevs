import { useProjectStore } from "@/state/useProjectStore";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { useEditorStore } from "@/state/useEditorStore";

export function buildAgentContext() {
  // Gracefully handle missing/stubbed stores
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectStore: any = useProjectStore?.getState?.() || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vfsStore: any = useFileSystemStore?.getState?.() || { files: {} };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorStore: any = useEditorStore?.getState?.() || { viewMode: 'desktop', selectedElements: [] };

  const currentProject = projectStore.currentProject;
  if (!currentProject) {
    return { error: "No active project" };
  }

  return {
    project: {
      name: currentProject.name,
      designSystem: currentProject.designSystem,
    },
    canvas: {
      rootElements: currentProject.rootOrder,
      components: currentProject.components,
    },
    vfs: {
      files: Object.keys(vfsStore.files || {}),
    },
    editor: {
      viewMode: editorStore.viewMode,
      selectedElements: editorStore.selectedElements,
    }
  };
}
