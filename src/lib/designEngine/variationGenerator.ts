
import { DesignArchetype, getRandomArchetype, getStylePrompt } from "./archetypes";
import { NIM_TASK_MODELS } from "@/config/nimModels";

export const VARIATION_MODELS = [
  NIM_TASK_MODELS.layout_power,
  NIM_TASK_MODELS.component_gen,
  NIM_TASK_MODELS.code_power,
  "gpt-4o",
  "meta/llama-3.1-405b-instruct", // High intelligence for layouts
  "mistralai/mistral-large-2407",
];

export const STYLE_SALTS = [
  "Use oversized typography for emphasis.",
  "Implement a dense, information-rich layout.",
  "Focus on negative space and breathing room.",
  "Use a 'split-screen' layout approach.",
  "Incorporate subtle micro-patterns in the background.",
  "Apply an asymmetrical grid for dynamic feel.",
  "Use 'extreme' padding (120px+) for sections.",
  "Implement a 'cards-on-glass' aesthetic.",
  "Focus on high-contrast interaction states.",
  "Use vertical text or rotated elements (5-10 degrees).",
];

export interface VariationRequest {
  componentType: string;
  context?: string;
  baseSpec?: unknown;
}

export function buildVariationPrompt(request: VariationRequest) {
  const archetype = getRandomArchetype();
  const salt = STYLE_SALTS[Math.floor(Math.random() * STYLE_SALTS.length)];
  const stylePrompt = getStylePrompt(archetype);

  return `
You are a High-Tier Design Architect. Your task is to generate a COMPLETELY NEW and UNIQUE variation of a "${request.componentType}" component.

REQUIRED DESIGN THEME:
${stylePrompt}

CREATIVE TWIST (Style Salt):
${salt}

COMPONENTS AVAILABLE IN REGISTRY:
- Use only standard component types (section, container, flex-row, flex-column, grid, image, heading, text, button, card, badge, testimonial, feature).

INSTRUCTIONS:
1. DO NOT duplicate existing designs. Change the structure, hierarchy, and visual weight.
2. Every variation must be "Production-Ready" JSON.
3. Use specialized CSS values provided in the Archetype.
4. If it's a composite component (Hero, Feature Section), use Blueprint syntax (nested children).
5. Ensure the design feels "Award-Winning" and premium.

Output RAW JSON following this structure:
{
  "variationId": "unique-slug",
  "baseType": "${request.componentType}",
  "blueprint": {
    "type": "...",
    "css": { ... },
    "props": { ... },
    "children": [ ... ]
  }
}
  `.trim();
}

export function selectRandomModel(): string {
  return VARIATION_MODELS[Math.floor(Math.random() * VARIATION_MODELS.length)];
}
