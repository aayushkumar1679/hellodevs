import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import JSZip from "jszip";

// We re-use the same generateNextJsProject from exporter server-side
// The exporter module is client-safe (no browser apis) so this works.
// NOTE: If it has browser imports, stub them out or move to a shared util.

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional

  if (!VERCEL_TOKEN) {
    return NextResponse.json(
      { error: "VERCEL_TOKEN environment variable not set. Add it to .env.local." },
      { status: 400 }
    );
  }

  try {
    const { files, projectName } = await req.json() as {
      files: Array<{ name: string; content: string }>;
      projectName: string;
    };

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "files array is required" }, { status: 400 });
    }

    // Convert files to Vercel deployment format
    const vercelFiles = files.map((f) => ({
      file: f.name,
      data: Buffer.from(f.content, "utf-8").toString("base64"),
      encoding: "base64",
    }));

    const slug = (projectName || "polyglot-site")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);

    const deployUrl = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}`
      : "https://api.vercel.com/v13/deployments";

    const response = await fetch(deployUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: slug,
        files: vercelFiles,
        projectSettings: {
          framework: "nextjs",
          buildCommand: "next build",
          outputDirectory: ".next",
          installCommand: "npm install",
        },
        target: "production",
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err?.error?.message || "Vercel deployment failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      deploymentId: data.id,
      deploymentUrl: `https://${data.url}`,
      readyState: data.readyState,
    });
  } catch (error: any) {
    console.error("Deploy error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

// Check deployment status
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  if (!VERCEL_TOKEN) return NextResponse.json({ error: "No VERCEL_TOKEN" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const deploymentId = searchParams.get("id");

  if (!deploymentId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const resp = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  const data = await resp.json();

  return NextResponse.json({
    readyState: data.readyState,
    url: data.url ? `https://${data.url}` : null,
  });
}
