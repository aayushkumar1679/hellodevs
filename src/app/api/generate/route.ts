import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      prompt,
      model = "gpt-4o",
    } = (await req.json()) as {
      prompt?: string;
      model?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Determine Provider & Client
    let apiKey = process.env.OPENAI_API_KEY;
    let baseURL = undefined;

    if (model.includes("phi-3.5")) {
      apiKey = process.env.NVIDIA_PHI_API_KEY;
      baseURL = "https://integrate.api.nvidia.com/v1";
    } else if (model.includes("falcon3")) {
      apiKey = process.env.NVIDIA_FALCON_API_KEY;
      baseURL = "https://integrate.api.nvidia.com/v1";
    }

    const client = new OpenAI({ apiKey, baseURL });

    const systemPrompt = `
You are Polyglot AI, a world-class web designer and engineer generating an emergent, vast, and highly-detailed website layout.

### UI GUIDELINES:
- Output a massively detailed component tree. The layout should be rich, containing 20+ distinct sections (hero, features, grid, testimonials, articles, etc.) forming a complete emergent site.
- Use vibrant, harmonious color palettes (no plain colors).
- Prioritize visual excellence: smooth gradients, glassmorphism (rgba(255,255,255,0.7) + backdrop-filter), and modern typography.
- Ensure pixel-perfect layout using responsive grids and flexbox.

### COMPONENT TYPES:
For structure, leverage the following robust layout types:
layout: section, container, flex-row, flex-column, grid, spacer, divider
content: heading, text, button, card, badge
media: image

If a specific component doesn't fit standard macros, describe its visual look entirely in "css" props using standard CSS properties (camelCase format).

### IMAGE ASSETS (CRITICAL):
For any image, you MUST output a prop called \`imagePrompt\`.
This \`imagePrompt\` should be a highly detailed, descriptive prompt for generating the image using NVIDIA FLUX.1-dev AI model. 
Example image object:
{ "type": "image", "props": { "imagePrompt": "A highly detailed photorealistic shot of a futuristic metropolis bathed in neon cyberpunk glow, volumetric lighting, 8k" }, "css": { "width": "100%", "height": "400px", "borderRadius": "24px", "objectFit": "cover" } }
Do NOT provide ordinary \`src\` or \`alt\` tags if you want the image generated. Provide \`imagePrompt\`.

### OUTPUT FORMAT:
You must output a strictly valid JSON object. 
{
  "projectName": "Generated World-Class Landing Page",
  "summary": "Massive 2000-line generated layout with FLUX images...",
  "roots": [
    { "type": "navbar", "css": { ... } },
    { "type": "section", "css": { "backgroundColor": "#0f172a", "padding": "120px 32px" }, "children": [ ... deeply nested components ... ] }
  ]
}

CRITICAL RULES:
- Return ONLY the JSON object. No markdown ticks outside the JSON if possible, but the client will parse strings robustly.
- Ensure the tree is extremely deep and varied (an "infinite" single page site layout).
- Every image MUST have an \`imagePrompt\` prop.
- Output massive, rich layouts. Do not stop early.

Prompt: ${prompt}
    `;

    const stream = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a professional web builder engine that outputs strict JSON." },
        { role: "user", content: systemPrompt },
      ],
      stream: true,
      max_tokens: 4096,
      // response_format: { type: "json_object" }, // NVIDIA models might not support this property
    });

    // Create a ReadableStream to pipe the tokens forward
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate",
      },
      { status: 500 }
    );
  }
}
