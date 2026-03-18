import { NextResponse } from "next/server";
import { spawn } from "child_process";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { instruction } = await req.json();

  if (!process.env.CLAWD_ENABLED || process.env.CLAWD_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Clawd is disabled. Set CLAWD_ENABLED=true to enable." },
      { status: 503 }
    );
  }

  if (!instruction) {
    return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const child = spawn("openclaw", ["task", instruction, "--provider", "polyglot"]);

    child.stdout.on("data", (chunk) => {
      writer.write(encoder.encode(`data: ${chunk.toString()}\n\n`));
    });

    child.stderr.on("data", (chunk) => {
      writer.write(encoder.encode(`data: ${chunk.toString()}\n\n`));
    });

    child.on("close", () => {
      writer.write(encoder.encode("event: done\ndata: ok\n\n"));
      writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    writer.close();
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Clawd execution failed" },
      { status: 500 }
    );
  }
}
