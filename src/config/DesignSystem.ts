/**
 * DesignSystem.ts
 * Global design token registry for Polyglot.
 * Typography scale, color palette, space/shadow tokens.
 */

export interface ColorPalette {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface TypographyToken {
  fontFamily: string;
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
    "5xl": string;
  };
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeights: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
  };
}

export interface ShadowToken {
  id: string;
  name: string;
  value: string;
}

export interface BorderRadiusToken {
  id: string;
  name: string;
  value: string;
}

export interface SpacingScale {
  "0": string;
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  "6": string;
  "8": string;
  "10": string;
  "12": string;
  "16": string;
  "20": string;
  "24": string;
  "32": string;
  "40": string;
  "48": string;
  "64": string;
}

export interface DesignSystemTokens {
  colors: ColorPalette;
  typography: TypographyToken;
  shadows: ShadowToken[];
  radii: BorderRadiusToken[];
  spacing: SpacingScale;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_DESIGN_SYSTEM: DesignSystemTokens = {
  colors: {
    background: "#0f172a",
    surface: "#1e293b",
    primary: "#f8fafc",
    secondary: "#94a3b8",
    accent: "#6366f1",
  },
  typography: {
    fontFamily: "'Manrope', sans-serif",
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      tight: 1.1,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  shadows: [
    { id: "none", name: "None", value: "none" },
    { id: "sm", name: "Small", value: "0 2px 8px -2px rgba(0,0,0,0.2)" },
    { id: "md", name: "Medium", value: "0 8px 24px -6px rgba(0,0,0,0.3)" },
    { id: "lg", name: "Large", value: "0 24px 60px -20px rgba(0,0,0,0.45)" },
    { id: "xl", name: "XL", value: "0 40px 100px -30px rgba(0,0,0,0.55)" },
    { id: "glow-accent", name: "Glow Accent", value: "0 0 40px -10px var(--poly-color-accent)" },
    { id: "glow-primary", name: "Glow Primary", value: "0 0 40px -10px var(--poly-color-primary)" },
  ],
  radii: [
    { id: "none", name: "None", value: "0px" },
    { id: "sm", name: "Small", value: "6px" },
    { id: "md", name: "Medium", value: "12px" },
    { id: "lg", name: "Large", value: "20px" },
    { id: "xl", name: "XL", value: "28px" },
    { id: "full", name: "Full", value: "9999px" },
  ],
  spacing: {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
    "32": "128px",
    "40": "160px",
    "48": "192px",
    "64": "256px",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a design system's colors into CSS custom property entries. */
export function designSystemToCssVars(ds: DesignSystemTokens): Record<string, string> {
  return {
    "--poly-color-background": ds.colors.background,
    "--poly-color-surface": ds.colors.surface,
    "--poly-color-primary": ds.colors.primary,
    "--poly-color-secondary": ds.colors.secondary,
    "--poly-color-accent": ds.colors.accent,
    "--poly-font-family": ds.typography.fontFamily,
    "--poly-font-size-base": ds.typography.sizes.base,
  };
}

/** Generate a `<style>` block from the design system for injecting into exports. */
export function designSystemToStyleBlock(ds: DesignSystemTokens): string {
  const vars = designSystemToCssVars(ds);
  const varLines = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n${varLines}\n}`;
}

/** Curated palettes for the "Quick Palettes" picker. */
export const QUICK_PALETTES: Array<{ name: string; colors: ColorPalette }> = [
  {
    name: "Midnight Ink",
    colors: { background: "#0f172a", surface: "#1e293b", primary: "#f8fafc", secondary: "#94a3b8", accent: "#6366f1" },
  },
  {
    name: "Warm Amber",
    colors: { background: "#fffbf0", surface: "#fff8e6", primary: "#1c1410", secondary: "#78614a", accent: "#f59e0b" },
  },
  {
    name: "Ocean Deep",
    colors: { background: "#050c1a", surface: "#0d1f33", primary: "#e0f2fe", secondary: "#7dd3fc", accent: "#0ea5e9" },
  },
  {
    name: "Emerald Forest",
    colors: { background: "#052e16", surface: "#14532d", primary: "#f0fdf4", secondary: "#86efac", accent: "#22c55e" },
  },
  {
    name: "Rose Petal",
    colors: { background: "#fff1f2", surface: "#ffe4e6", primary: "#1f0a0c", secondary: "#9f1239", accent: "#f43f5e" },
  },
  {
    name: "Arctic White",
    colors: { background: "#f8fafc", surface: "#ffffff", primary: "#0f172a", secondary: "#475569", accent: "#3b82f6" },
  },
  {
    name: "Neon Dark",
    colors: { background: "#000000", surface: "#111111", primary: "#ffffff", secondary: "#aaaaaa", accent: "#00ff88" },
  },
  {
    name: "Purple Dusk",
    colors: { background: "#13031e", surface: "#200739", primary: "#faf5ff", secondary: "#c4b5fd", accent: "#a855f7" },
  },
];
