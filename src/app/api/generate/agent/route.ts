/**
 * /api/generate/agent — Full multi-mode agent route.
 * Accepts: { mode, systemPrompt, userMessage, context }
 * Returns: { result: string } — always a raw JSON string for the client to parse.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export const maxDuration = 60;

type AgentMode = "design" | "code" | "architect" | "screenshot";

interface AgentRequestBody {
  mode: AgentMode;
  systemPrompt: string;
  userMessage: string;
  context?: Record<string, unknown>;
  model?: string;
}

function getModel(modelId = "claude-3-5-sonnet-20241022") {
  if (modelId.includes("claude")) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic(modelId);
  }
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai(modelId.includes("gpt") ? modelId : "gpt-4o");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as AgentRequestBody;
    const { mode, systemPrompt, userMessage, model } = body;

    if (!mode || !userMessage) {
      return NextResponse.json(
        { error: "mode and userMessage are required" },
        { status: 400 }
      );
    }

    const aiModel = getModel(model);

    const { text } = await generateText({
      model: aiModel,
      system: systemPrompt || `You are a Polyglot ${mode} agent. Return ONLY valid JSON.`,
      prompt: userMessage,
      temperature: 0.4,
    });

    // Strip any accidental markdown fences
    let result = text.trim();
    if (result.startsWith("```")) {
      result = result
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Agent API failed" },
      { status: 500 }
    );
  }
}
