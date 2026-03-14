import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { COMPONENT_LIBRARY } from "@/config/componentRegistry";

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

export const maxDuration = 60; // Allow longer execution for Vercel

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, model = "gpt-4o", mode = "generate", currentLayout = "", chatContext } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }


    let aiModel;

    // Determine Provider & Client
    if (model.includes("gpt")) {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      aiModel = openai(model);
    } else if (model.includes("claude")) {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      aiModel = anthropic(model);
    } else if (model.includes("phi-3.5") || model.includes("falcon3")) {
      // NVIDIA NIMs via OpenAI compatibility layer
      const nvidiaClient = createOpenAI({
        apiKey: process.env.NVIDIA_API_KEY || process.env.NVIDIA_PHI_API_KEY || process.env.NVIDIA_FALCON_API_KEY,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });
      aiModel = nvidiaClient(model);
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
- Color palette: ${projectContext.colorPalette ? JSON.stringify(projectContext.colorPalette) : "default"}` : ""}

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
2. Layout Architecture: Design a comprehensive, multi-section page (Hero with parallax, Social Proof/Logos, Features with icons, guest testimonials with avatars, high-end galleries, CTA, Footer).
3. Image Planning: For every image component, compose a highly detailed, cinematic image prompt for NVIDIA FLUX. Focus on lighting, texture, and mood.
4. Animation Advisor: Assign appropriate Framer Motion animations to components (e.g., hero gets fade-up, features stagger in, cards hover-float).
5. Designer's Touch: Use elegant serif headings for luxury themes, generous white space (min 120px section padding), and subtle glassmorphism for overlays.
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
