import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, model } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `
You are Polyglot AI, a world-class web designer and engineer. 
Your goal is to generate a high-end, premium landing page structure based on a user prompt.

### UI GUIDELINES:
- Use vibrant, harmonious color palettes (no plain colors).
- Prioritize visual excellence: smooth gradients, glassmorphism (rgba(255,255,255,0.7) + backdrop-filter), and modern typography.
- Use the provided component library types.
- Layout must be responsive (mobile stackable, desktop spacious).

### COMPONENT TYPES:
- layout: section, container, flex-row, flex-column, grid, spacer, divider
- navigation: navbar
- content: heading, text, button, card
- media: image
- marketing: hero, feature-section, testimonial-section, pricing-section, cta
- form: form, input, textarea

### DATA STRUCTURE:
You must return a JSON object that matches the GeneratedProjectPayload type:
{
  "projectName": string,
  "summary": string,
  "roots": GeneratedComponentNode[]
}

GeneratedComponentNode {
  "type": string,
  "props": Record<string, any>, (optional)
  "css": Record<string, any>, (optional)
  "children": GeneratedComponentNode[] (optional)
}

### CRITICAL RULES:
- "roots" should contain the top-level sections (navbar, hero, features, etc.).
- Use "type" exactly as listed above.
- Return ONLY valid JSON.
- For "css", use standard CSS properties in camelCase (e.g., backgroundColor, borderRadius).

Prompt: ${prompt}
    `;

    const response = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional web builder engine that outputs strict JSON." },
        { role: "user", content: systemPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate" }, { status: 500 });
  }
}
