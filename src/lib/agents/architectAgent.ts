/**
 * Architect Agent
 * Sends a feature description + project file structure to /api/generate/agent with mode: 'architect'.
 * Returns a typed ArchitectPlan with a steps array for interactive checklist rendering.
 */

import { buildAgentContext } from "./contextBuilder";

export interface ArchitectStep {
  id: string;
  title: string;
  description: string;
  files: string[];
  status: "pending" | "active" | "done" | "error";
}

export interface ArchitectPlan {
  type: "plan";
  title: string;
  summary: string;
  steps: ArchitectStep[];
}

export interface ArchitectAgentResult {
  plan: ArchitectPlan;
  artifact: ArchitectPlan;
}

export async function runArchitectAgent(prompt: string): Promise<ArchitectAgentResult> {
  const ctx = buildAgentContext();
  if ("error" in ctx) {
    throw new Error(ctx.error as string);
  }

  const systemPrompt = `You are a world-class software architect agent embedded in a visual IDE.
You will receive a feature description and the current project's file structure.
Produce a complete, multi-step implementation plan.
Return ONLY valid JSON — no markdown, no explanation outside the JSON.
Schema:
{
  "title": "Plan title",
  "summary": "One-paragraph summary of the approach",
  "steps": [
    {
      "id": "step-1",
      "title": "Step title",
      "description": "Detailed description of what to do in this step",
      "files": ["src/app/example.ts", "prisma/schema.prisma"]
    }
  ]
}
All step IDs must be unique strings like "step-1", "step-2", etc.`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectFiles = (ctx as any).vfs?.files as string[] | undefined;
  const userMessage = `Feature request: ${prompt}\n\nProject files:\n${(projectFiles || []).join("\n")}`;

  const res = await fetch("/api/generate/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "architect",
      systemPrompt,
      userMessage,
      context: ctx,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();

  const raw: string =
    typeof data.result === "string"
      ? data.result
      : JSON.stringify(data.result || data);
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as {
    title: string;
    summary: string;
    steps: Array<{
      id: string;
      title: string;
      description: string;
      files: string[];
    }>;
  };

  const plan: ArchitectPlan = {
    type: "plan",
    title: parsed.title,
    summary: parsed.summary,
    steps: parsed.steps.map((s) => ({
      ...s,
      status: "pending" as const,
    })),
  };

  return {
    plan,
    artifact: plan,
  };
}
