import { NextResponse } from "next/server";

const getBaseUrl = () => process.env.PYTHON_SERVICE_URL || "";

function buildTargetUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, baseUrl).toString();
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "PYTHON_SERVICE_URL not configured" },
      { status: 500 }
    );
  }
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "/health";

  const target = buildTargetUrl(baseUrl, path);
  const res = await fetch(target, { method: "GET" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}

export async function POST(req: Request) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "PYTHON_SERVICE_URL not configured" },
      { status: 500 }
    );
  }
  const payload = await req.json();
  const path = payload?.path || "/pipeline/run";
  const body = payload?.body ?? {};

  const target = buildTargetUrl(baseUrl, path);
  const res = await fetch(target, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
  });
}
