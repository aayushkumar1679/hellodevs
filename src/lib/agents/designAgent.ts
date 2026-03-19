/**
 * Design Agent
 * Sends selected CanvasElements + user prompt to /api/generate/agent with mode: 'design'.
 * Returns updatedElements (updated canvas tree) + a design artifact for before/after preview.
 */

import { buildAgentContext } from "./contextBuilder";
import { PolyglotComponent } from "@/state/useProjectStore";

export interface DesignArtifact {
  type: "design";
  before: PolyglotComponent[];
  after: PolyglotComponent[];
  explanation: string;
  changes: string[];
}

export interface DesignAgentResult {
  updatedElements: Record<string, PolyglotComponent>;
  artifact: DesignArtifact;
}

export async function runDesignAgent(
  prompt: string,
  selectedElementIds: string[]
): Promise<DesignAgentResult> {
  const ctx = buildAgentContext();
  if ("error" in ctx) {
    throw new Error(ctx.error as string);
  }

  const project = ctx as ReturnType<typeof buildAgentContext> & { canvas: { components: Record<string, PolyglotComponent> } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allComponents = (project as any).canvas?.components as Record<string, PolyglotComponent> | undefined;

  const selectedElements: PolyglotComponent[] = selectedElementIds
    .map((id) => allComponents?.[id])
    .filter(Boolean) as PolyglotComponent[];

  const systemPrompt = `You are a world-class UI/UX design agent with visual context of the canvas.
You will receive selected canvas elements and a design instruction.
Apply design improvements following the given design system.
Return ONLY valid JSON, no markdown, no explanation outside the JSON.
Schema:
{
  "updatedElements": { "<elementId>": { ...updatedPolyglotComponent } },
  "explanation": "Short explanation of what was changed",
  "changes": ["change 1", "change 2", ...]
}`;

  const userMessage = `Selected elements:\n${JSON.stringify(selectedElements, null, 2)}\n\nTask: ${prompt}`;

  const res = await fetch("/api/generate/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "design",
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

  // Strip possible ```json fences
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
    updatedElements: Record<string, PolyglotComponent>;
    explanation: string;
    changes: string[];
  };

  const beforeElements = selectedElements;
  const afterElements = Object.values(parsed.updatedElements);

  const artifact: DesignArtifact = {
    type: "design",
    before: beforeElements,
    after: afterElements,
    explanation: parsed.explanation || "",
    changes: parsed.changes || [],
  };

  return {
    updatedElements: parsed.updatedElements,
    artifact,
  };
}
