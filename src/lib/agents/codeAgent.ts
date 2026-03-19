/**
 * Code Agent
 * Sends the active file path + content + user prompt to /api/generate/agent with mode: 'code'.
 * Returns updatedContent (full new file), diff (unified diff string), and a code artifact.
 */

import { buildAgentContext } from "./contextBuilder";

export interface CodeArtifact {
  type: "code";
  filePath: string;
  before: string;
  after: string;
  diff: string;
  explanation: string;
}

export interface CodeAgentResult {
  updatedContent: string;
  diff: string;
  artifact: CodeArtifact;
}

/**
 * Generates a minimal unified diff between two strings (line-level).
 * Uses a simple line comparison — good enough for display purposes.
 */
function generateUnifiedDiff(filePath: string, before: string, after: string): string {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const diffLines: string[] = [`--- a/${filePath}`, `+++ b/${filePath}`];

  // Simple whole-file diff block
  diffLines.push(`@@ -1,${beforeLines.length} +1,${afterLines.length} @@`);
  for (const line of beforeLines) {
    diffLines.push(`-${line}`);
  }
  for (const line of afterLines) {
    diffLines.push(`+${line}`);
  }
  return diffLines.join("\n");
}

export async function runCodeAgent(
  prompt: string,
  filePath: string,
  fileContent: string
): Promise<CodeAgentResult> {
  const ctx = buildAgentContext();
  if ("error" in ctx) {
    throw new Error(ctx.error as string);
  }

  const systemPrompt = `You are a world-class senior software engineer agent.
You will receive a source file and a coding task.
Apply the requested change to the file.
Return ONLY valid JSON — no markdown, no explanation outside the JSON.
Schema:
{
  "updatedContent": "The complete updated file content as a string",
  "explanation": "A concise explanation of what was changed and why"
}`;

  const userMessage = `File: ${filePath}\n\nContent:\n\`\`\`\n${fileContent}\n\`\`\`\n\nTask: ${prompt}`;

  const res = await fetch("/api/generate/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "code",
      systemPrompt,
      userMessage,
      context: {
        ...ctx,
        activeFile: filePath,
        fileContent,
      },
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
    updatedContent: string;
    explanation: string;
  };

  const diff = generateUnifiedDiff(filePath, fileContent, parsed.updatedContent);

  const artifact: CodeArtifact = {
    type: "code",
    filePath,
    before: fileContent,
    after: parsed.updatedContent,
    diff,
    explanation: parsed.explanation || "",
  };

  return {
    updatedContent: parsed.updatedContent,
    diff,
    artifact,
  };
}
