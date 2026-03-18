import type { PolyglotComponent } from "@/state/useProjectStore";

export type Breakpoint = "desktop" | "tablet" | "mobile";

export default class DesignerStyles {
  /**
   * Resolves CSS overrides for a specific breakpoint, merging them with base styles.
   */
  static resolveForBreakpoint(
    overrides: PolyglotComponent["cssOverrides"],
    breakpoint: Breakpoint,
  ): React.CSSProperties {
    const base = overrides.base || {};
    const tablet = overrides.tablet || {};
    const mobile = overrides.mobile || {};

    const resolved: React.CSSProperties = { ...base };

    if (breakpoint === "tablet" || breakpoint === "mobile") {
      Object.assign(resolved, tablet);
    }
    if (breakpoint === "mobile") {
      Object.assign(resolved, mobile);
    }

    return resolved;
  }

  /**
   * Helper to convert kebab-case to camelCase (for raw CSS manipulation if needed)
   */
  static toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
}
