import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/png", prompt = "" } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
    }

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = openai("gpt-4o");

    const systemPrompt = `You are Polyglot AI Vision, a world-class UX/UI designer specialized in reconstructing website layouts from screenshots.
Given a screenshot of a website or wireframe, you will:
1. Analyze the visual structure, sections, colors, and typography
2. Reconstruct it as a set of Polyglot components matching the available component library

COMPONENT LIBRARY (only use these types):
section, container, flex-row, flex-column, grid, card, navbar, heading, text, button, image, badge, feature, testimonial, pricing-card, footer, cta, divider, spacer

You MUST return valid raw JSON (no markdown code blocks) in this EXACT format:
{
  "projectName": "Reconstructed from screenshot",
  "summary": "A brief description of reconstructed layout",
  "designSystem": {
    "colors": {
      "background": "#hex",
      "surface": "#hex", 
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex"
    }
  },
  "roots": [
    {
      "type": "navbar",
      "props": { "brand": { "text": "Brand", "href": "#" }, "links": [{"href": "#", "label": "Home"}] },
      "css": { "backgroundColor": "var(--poly-color-surface)", "padding": "16px 32px", "display": "flex", "alignItems": "center" }
    },
    {
      "type": "section",
      "css": { "backgroundColor": "var(--poly-color-background)", "padding": "80px 24px", "textAlign": "center" },
      "animations": [{"id": "anim-1", "preset": "fade-up", "trigger": "scroll", "duration": 0.6, "delay": 0}],
      "children": [
        { "type": "heading", "props": { "text": "Reconstructed Heading", "level": 1 }, "css": { "fontSize": "3rem", "fontWeight": "800", "color": "var(--poly-color-primary)" } },
        { "type": "text", "props": { "text": "Reconstructed subtext" }, "css": { "color": "var(--poly-color-secondary)" } }
      ]
    }
  ]
}

Be thorough. Reconstruct every visible section faithfully while mapping to Polyglot's component system.
${prompt ? `\nAdditional user instructions: ${prompt}` : ""}`;

    const result = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: `data:${mimeType};base64,${imageBase64}`,
            },
            {
              type: "text",
              text: "Reconstruct this website layout into Polyglot components. Return raw JSON only.",
            },
          ],
        },
      ],
    });

    // Clean the response
    let json = result.text.trim();
    if (json.startsWith("```")) {
      json = json.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
    }

    // Validate it's JSON
    JSON.parse(json); // throws if invalid

    return NextResponse.json({ result: json });
  } catch (error) {
    console.error("Vision reconstruction error:", error);
    return NextResponse.json(
      { error: "Failed to reconstruct layout from image" },
      { status: 500 }
    );
  }
}
