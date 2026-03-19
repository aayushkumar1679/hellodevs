import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { useProjectStore } from "@/state/useProjectStore";
import { toast } from "sonner";

/**
 * Parses a given TSX source and attempts to map changes back into the visual canvas elements.
 * Uses @babel/parser and @babel/traverse to extract the JSX tree structure.
 */
export function syncCodeToCanvas(filePath: string, sourceCode: string) {
  try {
    const ast = parse(sourceCode, {
      sourceType: "module",
      plugins: ["jsx", "typescript"]
    });

    const store = useProjectStore.getState();
    const currentProject = store.currentProject;
    
    if (!currentProject) return;

    // Example mapping heuristic: Extract root component ID from the filename
    // e.g. "src/components/Hero_abc123.tsx"
    const match = filePath.match(/_([a-zA-Z0-9\-]+)\.tsx$/);
    const rootId = match ? match[1] : null;

    if (!rootId && filePath.includes("page.tsx")) {
      // It's the main page. We might need to diff all component usages.
      console.log("Parsing page.tsx for layout changes");
    }

    if (rootId && currentProject.components[rootId]) {
      // In a full AST mapper, we'd reconstruct the entire CanvasElement tree from JSX:
      // - Find the default export function
      // - Traverse its return statement JSX
      // - Map each JSXElement to a polyglot component configuration
      
      let foundProps = false;
      
      traverse(ast, {
        JSXElement(path: any) {
          // Placeholder for real extraction logic
          if (!foundProps) {
            // Found the outermost JSX element corresponding to the component
            // Extract style={}, className="", and other props
            foundProps = true;
          }
        }
      });
      
      // We apply minimal diffs to avoid full re-renders
      // store.updateComponent(rootId, { updated properties... });
    }
    
    return true; // Indicates success
  } catch (error) {
    console.warn("Fast AST sync failed:", error);
    return false;
  }
}
