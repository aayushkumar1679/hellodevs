/**
 * Screenshot Agent
 * Wraps the existing /api/generate/vision route.
 * Accepts a base64 image string and returns reconstructed CanvasElements
 * as a design artifact for before/after canvas preview.
 */

import { PolyglotComponent } from "@/state/useProjectStore";

export interface ScreenshotArtifact {
  type: "design";
  before: PolyglotComponent[];
  after: PolyglotComponent[];
  explanation: string;
  changes: string[];
}

export interface ScreenshotAgentResult {
  reconstructedElements: PolyglotComponent[];
  artifact: ScreenshotArtifact;
}

/**
 * Converts a File or Blob to a base64 string (without the data: prefix).
 */
export async function fileToBase64(file: File | Blob): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:<mimeType>;base64,<data>"
      const [header, base64] = result.split(",");
      const mimeType = header.replace("data:", "").replace(";base64", "");
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function runScreenshotAgent(
  imageBase64: string,
  mimeType = "image/png",
  additionalPrompt = ""
): Promise<ScreenshotAgentResult> {
  const res = await fetch("/api/generate/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      prompt: additionalPrompt,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.result) {
    throw new Error("Vision API returned no result");
  }

  // The vision route returns a JSON string inside data.result
  const raw: string =
    typeof data.result === "string" ? data.result : JSON.stringify(data.result);
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as {
    projectName?: string;
    summary?: string;
    roots?: Array<{
      type: string;
      props?: Record<string, unknown>;
      css?: Record<string, unknown>;
      children?: unknown[];
    }>;
  };

  // Convert the raw "roots" array into PolyglotComponent-like objects for the canvas
  const reconstructedElements: PolyglotComponent[] = (parsed.roots || []).map(
    (root, idx) => ({
      id: `screenshot-${Date.now()}-${idx}`,
      type: root.type,
      props: root.props || {},
      cssOverrides: { base: root.css || {} },
      animations: [],
      assets: [],
      children: [],
      meta: { label: root.type },
    })
  );

  const artifact: ScreenshotArtifact = {
    type: "design",
    before: [],
    after: reconstructedElements,
    explanation: parsed.summary || "Layout reconstructed from screenshot",
    changes: reconstructedElements.map((el) => `Added ${el.type} component`),
  };

  return {
    reconstructedElements,
    artifact,
  };
}
