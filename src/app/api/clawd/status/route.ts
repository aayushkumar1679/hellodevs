import { NextResponse } from "next/server";
import { spawnSync } from "child_process";

export async function GET() {
  if (!process.env.CLAWD_ENABLED || process.env.CLAWD_ENABLED !== "true") {
    return NextResponse.json({ running: false, reason: "disabled" });
  }

  try {
    const result = spawnSync("openclaw", ["--version"], {
      encoding: "utf-8",
    });
    if (result.error) {
      return NextResponse.json({ running: false, reason: "missing" });
    }
    return NextResponse.json({ running: true, version: result.stdout.trim() });
  } catch (error) {
    return NextResponse.json({
      running: false,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}
