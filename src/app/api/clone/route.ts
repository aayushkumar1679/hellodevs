import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { COMPONENT_LIBRARY } from "@/config/componentRegistry";
import {
  getNimApiKeyForModel,
  normalizeNimModelId,
  NIM_BASE_URL,
} from "@/config/nimModels";

const MAX_HTML_CHARS = 12000;

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

function stripHtml(raw: string) {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url, model = "qwen/qwen3.5-397b-a17b" } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let html = "";
    let pageTitle = "";
    let pageDescription = "";
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 PolyglotBuilder" },
      });
      html = await res.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      pageTitle = titleMatch?.[1]?.trim() || "";
      const descMatch = html.match(
        /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i
      );
      pageDescription = descMatch?.[1]?.trim() || "";
    } catch {
      html = "";
    }

    const cleanedHtml = html ? stripHtml(html) : "";
    const htmlSnippet = cleanedHtml.slice(0, MAX_HTML_CHARS);

    const modelId = normalizeNimModelId(model);
    const nimKey = getNimApiKeyForModel(modelId) || process.env.NVIDIA_API_KEY;
    if (!nimKey) {
      return NextResponse.json(
        { error: "NVIDIA API key not configured" },
        { status: 500 }
      );
    }

    const nim = createOpenAI({
      apiKey: nimKey,
      baseURL: process.env.NVIDIA_NIM_BASE_URL || NIM_BASE_URL,
    });

    const systemPrompt = `You are Polyglot AI Cloner. Analyze a website URL and reconstruct it into Polyglot component JSON.
Focus on recreating the structure, sections, and mood.

URL: ${url}
TITLE: ${pageTitle || "Unknown"}
META DESCRIPTION: ${pageDescription || "Not provided"}

HTML SNIPPET (truncated):
${htmlSnippet || "HTML not available; infer from URL only."}

Return a JSON object that matches the Polyglot Generation Schema:
{
  "projectName": "Cloned Site",
  "summary": "Reconstructed version of ${url}",
  "designSystem": {
    "colors": {
      "background": "#hex",
      "surface": "#hex",
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex"
    }
  },
  "roots": [ ... ]
}

COMPONENT LIBRARY (only use these types):
${getComponentSchema()}

Only return valid JSON. Do not wrap in code blocks.`;

    const { text } = await generateText({
      model: nim(modelId),
      system: systemPrompt,
      prompt: "Reconstruct this site into Polyglot JSON.",
      temperature: 0.5,
    });

    // Extract JSON if AI included markdown blocks
    const jsonString = text.replace(/```json\n?|\n?```/g, "").trim();
    
    return NextResponse.json(JSON.parse(jsonString));
  } catch (error) {
    console.error("Clone Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clone website" },
      { status: 500 }
    );
  }
}
