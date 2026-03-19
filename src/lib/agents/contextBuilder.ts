import { useProjectStore } from "@/state/useProjectStore";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { useEditorStore } from "@/state/useEditorStore";

export function buildAgentContext() {
  const projectStore = useProjectStore.getState();
  const vfsStore = useFileSystemStore.getState();
  const editorStore = useEditorStore.getState();

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
      files: Object.keys(vfsStore.files),
    },
    editor: {
      viewMode: editorStore.viewMode,
      selectedElements: editorStore.selectedElements,
    }
  };
}
