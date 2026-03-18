
export type DesignArchetype = 
  | "luxury" 
  | "brutalist" 
  | "minimalist" 
  | "memphis" 
  | "cyberpunk" 
  | "organic" 
  | "bauhaus" 
  | "glassmorphic"
  | "retro-future"
  | "industrial";

export interface StyleSeeds {
  rounding: string;
  gap: string;
  padding: string;
  borderWidth: string;
  fontFamily?: string;
  letterSpacing: string;
  shadow: string;
  glass?: {
    blur: string;
    opacity: string;
  };
}

export const ARCHETYPE_DEFINITIONS: Record<DesignArchetype, StyleSeeds> = {
  luxury: {
    rounding: "0px",
    gap: "48px",
    padding: "80px",
    borderWidth: "1px",
    letterSpacing: "0.1em",
    shadow: "0 10px 40px -20px rgba(0,0,0,0.1)",
  },
  brutalist: {
    rounding: "0px",
    gap: "0px",
    padding: "40px",
    borderWidth: "3px",
    letterSpacing: "-0.02em",
    shadow: "8px 8px 0px #000000",
  },
  minimalist: {
    rounding: "8px",
    gap: "24px",
    padding: "64px",
    borderWidth: "0px",
    letterSpacing: "-0.01em",
    shadow: "none",
  },
  memphis: {
    rounding: "32px",
    gap: "32px",
    padding: "48px",
    borderWidth: "2px",
    letterSpacing: "0.02em",
    shadow: "4px 4px 0px rgba(0,0,0,1)",
  },
  cyberpunk: {
    rounding: "2px",
    gap: "16px",
    padding: "32px",
    borderWidth: "1px",
    letterSpacing: "0.05em",
    shadow: "0 0 15px rgba(0,255,255,0.3)",
    glass: { blur: "10px", opacity: "0.1" },
  },
  organic: {
    rounding: "64px",
    gap: "40px",
    padding: "72px",
    borderWidth: "0px",
    letterSpacing: "-0.03em",
    shadow: "0 20px 50px -10px rgba(0,0,0,0.05)",
  },
  bauhaus: {
    rounding: "0px",
    gap: "20px",
    padding: "40px",
    borderWidth: "1px",
    letterSpacing: "0em",
    shadow: "none",
  },
  glassmorphic: {
    rounding: "24px",
    gap: "24px",
    padding: "56px",
    borderWidth: "1px",
    letterSpacing: "0.01em",
    shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
    glass: { blur: "20px", opacity: "0.05" },
  },
  "retro-future": {
    rounding: "12px",
    gap: "28px",
    padding: "60px",
    borderWidth: "1px",
    letterSpacing: "0.08em",
    shadow: "0 0 20px rgba(255,0,255,0.2)",
  },
  industrial: {
    rounding: "4px",
    gap: "24px",
    padding: "48px",
    borderWidth: "2px",
    letterSpacing: "0.02em",
    shadow: "inset 0 0 10px rgba(0,0,0,0.1)",
  }
};

export function getRandomArchetype(): DesignArchetype {
  const keys = Object.keys(ARCHETYPE_DEFINITIONS) as DesignArchetype[];
  return keys[Math.floor(Math.random() * keys.length)];
}

export function getStylePrompt(archetype: DesignArchetype): string {
  const seeds = ARCHETYPE_DEFINITIONS[archetype];
  return `
STYLING ARCHETYPE: ${archetype.toUpperCase()}
Apply these characteristic traits:
- Border Radius: ${seeds.rounding}
- Element Gaps: ${seeds.gap}
- Vertical Spacing: ${seeds.padding}
- Border Width: ${seeds.borderWidth}
- Letter Spacing: ${seeds.letterSpacing}
- Shadows: ${seeds.shadow}
${seeds.glass ? `- Glassmorphism: Blur ${seeds.glass.blur}, Background Opacity ${seeds.glass.opacity}` : ""}
  `.trim();
}
