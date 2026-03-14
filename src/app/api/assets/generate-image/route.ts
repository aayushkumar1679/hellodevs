import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_IMAGE_API_KEY;
    if (!apiKey) {
      throw new Error("NVIDIA Image API key not configured");
    }

    // NVIDIA NIM stable-diffusion-xl API (or flux if available, using the standard structure for their ai.api endpoints)
    const response = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        seed: Math.floor(Math.random() * 100000),
        cfg_scale: 5,
        sampler: "K_EULER_ANCESTRAL",
        steps: 25
      }),
    });

    if (!response.ok) {
      let errorData: { error?: { message?: string }; message?: string } = {};
      try { errorData = await response.json(); } catch {}
      console.error("NVIDIA Image Generation Error:", response.status, errorData);
      throw new Error(
        errorData.error?.message || errorData.message || `NVIDIA API error: ${response.status}`
      );
    }

    const data = await response.json();

    // The response for this endpoint contains an array of artifacts
    const b64 = data.artifacts?.[0]?.base64;
    if (b64) {
      const url = `data:image/png;base64,${b64}`;
      return NextResponse.json({ url });
    }

    throw new Error("No image data received from NVIDIA");
  } catch (error) {
    console.error("Image Generation Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
