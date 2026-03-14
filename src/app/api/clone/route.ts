import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Phase 5.5: Competitor Website Clone
    // In a full production implementation, we would use Puppeteer/Playwright here
    // to screenshot the URL and extract the DOM structure.
    // For this implementation, we use AI to "imagine" the reconstruction based on 
    // the site's likely structure and modern design patterns, or fetching metadata.
    
    const systemPrompt = `You are Polyglot AI Cloner. Your task is to analyze a website URL and suggest a reconstructed version using the Polyglot Component JSON schema.
Focus on recreating the structure, sections, and mood.

URL to clone: ${url}

Return a JSON object that matches the Polyglot Generation Schema:
{
  "name": "Cloned Site",
  "summary": "Reconstructed version of ${url}",
  "roots": [
    {
      "type": "Navbar",
      "props": { "logo": "Brand", "links": ["Features", "Pricing", "About"] }
    },
    {
      "type": "Hero",
      "props": { "title": "Reconstructed Hero", "subtitle": "Visual analysis complete.", "cta": "Get Started" }
    },
    { "type": "Features", "props": { "title": "What they offer", "count": 3 } }
  ]
}

Only return valid JSON.`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Analyze ${url} and return the reconstruction JSON.`,
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
