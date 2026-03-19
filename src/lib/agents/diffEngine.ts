import { useProjectStore } from "@/state/useProjectStore";
import { useFileSystemStore } from "@/state/useFileSystemStore";
import { BlueprintNode } from "@/config/componentRegistry";

export interface AgentCommand {
  action: "ADD_COMPONENT" | "UPDATE_COMPONENT" | "DELETE_COMPONENT" | "UPDATE_THEME";
  targetId?: string;
  blueprint?: BlueprintNode & { code?: string, filePath?: string };
  payload?: unknown;
}

export async function applyAgentCommand(command: AgentCommand) {
  const projectStore = useProjectStore.getState();
  const vfsStore = useFileSystemStore.getState();
  
  try {
    switch (command.action) {
      case "ADD_COMPONENT": {
        if (!command.blueprint) throw new Error("Missing blueprint for ADD_COMPONENT");
        
        // 1. Write the associated React component code to the VFS
        if (command.blueprint.code && command.blueprint.filePath) {
          await vfsStore.writeFile(command.blueprint.filePath, command.blueprint.code);
        }
        
        // 2. Add the element directly to the internal canvas tree structure
        projectStore.addComponent(command.blueprint.type, undefined, command.blueprint.props, command.blueprint);
        break;
      }
      case "UPDATE_COMPONENT": {
        if (!command.targetId || !command.payload) break;
        projectStore.updateComponent(command.targetId, command.payload);
        break;
      }
      case "DELETE_COMPONENT": {
        if (!command.targetId) break;
        projectStore.removeComponent(command.targetId);
        break;
      }
      case "UPDATE_THEME": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((command.payload as any)?.colors) {
          const currentDs = projectStore.currentProject?.designSystem || { colors: {} };
          projectStore.updateProject({
            designSystem: {
              ...currentDs,
              colors: {
                ...currentDs.colors,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(command.payload as any).colors
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          });
        }
        break;
      }
      default:
        console.warn("Unknown agent command action:", command.action);
    }
    return true;
  } catch (err) {
    console.error("Failed to apply agent command", err);
    return false;
  }
}
