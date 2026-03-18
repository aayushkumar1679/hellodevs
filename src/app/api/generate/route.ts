import { streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { COMPONENT_LIBRARY } from "@/config/componentRegistry";
import {
  isNimModel,
  normalizeNimModelId,
  getNimApiKeyForModel,
  NIM_BASE_URL,
  NIM_TASK_MODELS,
} from "@/config/nimModels";

const getComponentSchema = () => {
  return JSON.stringify(
    COMPONENT_LIBRARY.map((c) => ({
      type: c.type,
      category: c.category,
      defaultProps: c.defaultProps,
      schema: c.blueprint ? "composite" : "primitive",
    })),
    null,
    2
  );
};

// Background Reasoning: Use powerful NIM models to analyze the brand and plan images
async function performBackgroundReasoning(prompt: string) {
  try {
    const nimKey = process.env.NIM_SHEET_MODEL_06_KEY || process.env.NVIDIA_API_KEY;
    if (!nimKey) return null;

    const nvidiaClient = createOpenAI({
      apiKey: nimKey,
      baseURL: NIM_BASE_URL,
    });

    const reasoningModel = nvidiaClient(NIM_TASK_MODELS.layout_power); // Qwen 122B

    const { text } = await generateText({
      model: reasoningModel,
      system: `You are a World-Class Brand Strategist and Design Architect.
Your task is to analyze the user's prompt and produce a "Design Specification" for a unique, award-winning website.

ARCHETYPES TO CONSIDER (Choose the best fit or mix):
- "High-End Luxury": Elegant serifs, massive white space, subtle gold/neutral tones, thin borders.
- "Cyberpunk / Tech": Dark mode, neon accents, high contrast, glassmorphism, sharp corners.
- "Brutalist": Bold typography, raw borders (2-4px), asymmetrical grids, vibrant primary colors, 0px border-radius.
- "Neo-Memphis": Pastel backgrounds, playful geometry, thick shadows, rounded corners (32px+), mixed patterns.
- "Modern Minimalist": Ultra-clean, san-serif, monochrome with one accent, breathable layouts.

PROMPT: ${prompt}

TASKS:
1. Style Archetype: Identify which archetype (or specific hybrid) you are using.
2. Brand Essence: 3 keywords describing the vibe.
3. Design Seeds (Procedural Values):
   - BASE_ROUNDING: (e.g. 0px, 8px, 48px)
   - SECTION_GAP: (e.g. 80px, 160px, 0px)
   - TYPO_SCALE: (e.g. "Oversized", "Elegant & Thin", "Bold Brutalist")
4. Color Strategy: Exactly 5 hex codes (Background, Surface, Primary text, Secondary text, Accent).
5. Image Manifest: Describe 4-5 key visual assets with artistic style (e.g. "Macro lens photography of...", "minimalist 3D isometric render of...")
6. Layout Blueprint: List the sections needed with a unique structural twist (e.g. "Hero with asymmetrical text overlap").

Output strictly in this format:
ARCHETYPE: ...
BRAND_VIBE: ...
DESIGN_SEEDS: (Rounding: ..., Gaps: ..., Typo: ...)
COLORS: ...
IMAGES: ...
SECTIONS: ...`,
      prompt: "Generate the design specification.",
    });

    return text;
  } catch (error) {
    console.error("Background Reasoning Error:", error);
    return null;
  }
}

export const maxDuration = 60; // Allow longer execution for Vercel

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      prompt,
      model = "gpt-4o",
      mode = "generate",
      currentLayout = "",
      chatContext,
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Call Background Reasoning for new generations
    let designSpec = "";
    if (mode === "generate") {
      const spec = await performBackgroundReasoning(prompt);
      if (spec) {
        designSpec = `## BACKGROUND DESIGN SPECIFICATION (From specialized reasoning models):
${spec}
You MUST strictly follow this specification for colors and themes.`;
      }
    }

    let aiModel;

    const normalizedNimModel = normalizeNimModelId(model);
    const isNim =
      isNimModel(model) ||
      model.includes("/") ||
      normalizedNimModel !== model;

    // Determine Provider & Client
    if (isNim) {
      const nimKey =
        getNimApiKeyForModel(normalizedNimModel) ||
        process.env.NVIDIA_API_KEY ||
        process.env.NVIDIA_PHI_API_KEY ||
        process.env.NVIDIA_FALCON_API_KEY;
      if (!nimKey) {
        return NextResponse.json(
          { error: "NVIDIA API key not configured" },
          { status: 500 }
        );
      }
      const nvidiaClient = createOpenAI({
        apiKey: nimKey,
        baseURL: process.env.NVIDIA_NIM_BASE_URL || NIM_BASE_URL,
      });
      aiModel = nvidiaClient(normalizedNimModel);
    } else if (model.includes("claude")) {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      aiModel = anthropic(model);
    } else if (model.includes("gpt") || model.includes("o1")) {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      aiModel = openai(model);
    } else {
      // Fallback
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      aiModel = openai("gpt-4o");
    }

    const isIterate = mode === "iterate";
    const isChat = mode === "chat";

    // Chat mode: conversational design assistant that knows the project
    if (isChat) {
      const projectContext = chatContext?.projectContext;
      const chatSystemPrompt = `You are Polyglot AI, a world-class UX/UI design assistant embedded inside a visual website builder.
You have full knowledge of the user's current project.${projectContext ? `

CURRENT PROJECT:
- Name: ${projectContext.projectName}
- Components: ${projectContext.componentCount}
- Sections: ${(projectContext.rootComponents || []).join(", ")}
- Selected component ID: ${projectContext.selectedId || "none"}
- Selected component type: ${projectContext.selectedComponent || "none"}
- Color palette: ${projectContext.colorPalette ? JSON.stringify(projectContext.colorPalette) : "default"}
- Component Inventory (Valid IDs for mutations):
${(projectContext.componentInventory || []).map((c: { id: string; type: string; label?: string }) => `  * ID: "${c.id}" (Type: ${c.type}${c.label ? `, Label: ${c.label}` : ""})`).join("\n")}` : ""}

You MUST use the exact IDs from the "Component Inventory" above when using the 'updateComponent' action. If the inventory is empty, you can only use 'addComponent'.
Prefer using "selected" if the user is talking about what they are currently looking at.


You can answer questions about design, suggest improvements, and MOST IMPORTANTLY, you can make edits directly to the project.
To make an edit, you must include a code block with the language "polyglot-action" containing a JSON object.

SUPPORTED ACTIONS:
1. updateDesignSystem: { "action": "updateDesignSystem", "updates": { "colors": { "primary": "#hex", ... } } }
2. updateComponent: { "action": "updateComponent", "id": "TARGET_ID", "updates": { "props": { ... }, "cssOverrides": { "base": { ... } } } }
   - Use "selected" as the ID to target the currently selected component.
3. addComponent: { "action": "addComponent", "type": "Hero", "parentId": "TARGET_ID_OR_NULL" }

Example edit:
"I've updated the primary color to a more vibrant indigo for you.
\`\`\`polyglot-action
{ "action": "updateDesignSystem", "updates": { "colors": { "primary": "#4f46e5" } } }
\`\`\`"

Be concise, direct, and expert. You can combine a conversational response with one or more action blocks. Response in markdown.`;

      const messages = [
        ...(chatContext?.history || []),
        { role: "user" as const, content: prompt },
      ];

      const chatResult = streamText({
        model: aiModel,
        system: chatSystemPrompt,
        messages,
        temperature: 0.7,
      });

      return chatResult.toTextStreamResponse({
        headers: { "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

    const systemPrompt = `You are Polyglot AI, a world-class senior UX/UI designer and engineer. 
Your goal is to return a pixel-perfect, production-ready website design based on the user's prompt.

${designSpec}

## DESIGN VARIANCE & CREATIVITY (CRITICAL)
- **Break the Template**: Every website must feel unique. Do not repeat the same spacing or sizing.
- **Extreme CSS Freedom**: You have full control over CSS. Vary \`borderRadius\` (from 0px to 64px), \`borderWidth\`, \`letterSpacing\`, \`lineHeight\`, and \`gap\`.
- **Typography as Design**: Use massive font sizes for headings (up to 120px) if the style permits. Use \`textTransform: "uppercase"\` or \`fontStyle: "italic"\` for character.
- **Glass & Depth**: Use \`backdropFilter: "blur(20px)"\`, \`boxShadow\`, and \`linear-gradient\` to create depth.
- **Asymmetry**: Experiment with asymmetrical paddings and grids. Not everything needs to be centered.

${isIterate ? `## ITERATION MODE
You are modifying an EXISTING layout based on the user's request.
The current layout is provided below. You must return the ENTIRE updated JSON structure.
Keep the existing designSystem if there are no changes requested to the colors.
Keep the same structure unless requested otherwise, applying the requested mutations.

CURRENT LAYOUT:
${currentLayout}
` : `## THE MULTI-STEP PIPELINE
You must follow these 4 steps internally before generating the output:
1. Brand Analysis: Extract the core theme, mood, typography, and a cohesive 5-color palette (Background, Surface, Primary text, Secondary text, Accent).
2. Layout Architecture: Design a comprehensive, multi-section page (Hero with unique structural elements, Social Proof, interactive Features, multi-column Testimonials, high-end galleries, CTA, Footer).
3. Image Planning: For every image component, compose a highly detailed, cinematic image prompt for NVIDIA FLUX. vary the artistic style based on the ARCHETYPE.
4. Animation Advisor: Assign appropriate Framer Motion animations to components (e.g., "blur-in" for luxury, "slide-in" for tech).
5. Designer's Touch: Apply the chosen ARCHETYPE's characteristics (e.g. thick borders for Brutalist, massive rounding for Memphis).
`}

## OUTPUT FORMAT
You MUST output strictly valid JSON conforming exactly to this structure. DO NOT wrap the JSON in markdown code blocks like \`\`\`json. Return RAW JSON.
{
  "projectName": "Name of the project",
  "summary": "A 1-sentence summary of the generated theme and structure.",
  "designSystem": {
    "colors": {
      "background": "#HexCode",
      "surface": "#HexCode",
      "primary": "#HexCode",
      "secondary": "#HexCode",
      "accent": "#HexCode"
    }
  },
  "roots": [
    {
       "type": "navbar", 
       "css": { "backgroundColor": "var(--poly-color-surface)", "padding": "16px 32px", "display": "flex" } 
    },
    { 
       "type": "section", 
       "css": { "backgroundColor": "var(--poly-color-background)", "padding": "120px 24px" }, 
       "animations": [{"id": "anim-1", "preset": "fade-up", "trigger": "scroll", "duration": 0.8, "delay": 0.2}],
       "children": [ ... nested components ... ] 
    }
  ]
}

## COMPONENT ENCYCLOPEDIA
You MUST ONLY use components that exist in the following library. Do not invent new types.
If a component has \`defaultProps\`, you may override them by providing the same keys in the \`props\` object.
${getComponentSchema()}

## ANIMATIONS (CRITICAL)
You can optionally provide an \`animations\` array for components. 
Valid presets: "fade-in", "fade-up", "slide-in-left", "slide-in-right", "scale-up", "blur-in", "rotate-in", "hover-float", "hover-scale", "hover-glow", "tap-shrink", "stagger-children".
Valid triggers: "load", "scroll", "hover", "tap".
Example array: \`[{"id": "unique-uuid", "preset": "fade-up", "trigger": "scroll", "duration": 0.6, "delay": 0}]\`

## IMAGES (CRITICAL)
For every \`image\` component, you MUST provide an \`imagePrompt\` prop inside \`props\`:
{
  "type": "image",
  "props": { "imagePrompt": "A highly detailed photorealistic shot of a futuristic metropolis bathed in neon cyberpunk glow, volumetric lighting, 8k resolution" },
  "css": { "width": "100%", "height": "400px", "borderRadius": "24px", "objectFit": "cover" }
}
Do not use generic "src" urls. Always use "imagePrompt".

## STYLING RULES
- Do not use arbitrary CSS. Use exact valid camelCase properties.
- ONLY USE YOUR CSS VARIABLES for colors: "var(--poly-color-background)", "var(--poly-color-surface)", "var(--poly-color-primary)", "var(--poly-color-secondary)", "var(--poly-color-accent)". DO NOT use hardcoded hex values in \`css\`.
- Use glassmorphism where appropriate (backdropFilter: blur, rgba backgrounds).
- Output massive, rich layouts. Do not stop early.
- Output ONLY JSON.
`;

    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
    });

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate" },
      { status: 500 }
    );
  }
}
