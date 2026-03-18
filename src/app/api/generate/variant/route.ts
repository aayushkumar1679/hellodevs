
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

import { NIM_BASE_URL, normalizeNimModelId, getNimApiKeyForModel } from "@/config/nimModels";
import { buildVariationPrompt, selectRandomModel } from "@/lib/designEngine/variationGenerator";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { componentType, archetype: requestedArchetype } = await req.json();

    if (!componentType) {
      return NextResponse.json({ error: "Component type is required" }, { status: 400 });
    }

    const modelId = selectRandomModel();
    const prompt = buildVariationPrompt({ componentType });

    let aiModel;
    const normalizedModel = normalizeNimModelId(modelId);

    if (modelId === "gpt-4o") {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      aiModel = openai(modelId);
    } else {
      const nimKey = getNimApiKeyForModel(normalizedModel) || process.env.NVIDIA_API_KEY;
      if (!nimKey) {
        throw new Error(`NVIDIA API key not configured for model ${normalizedModel}`);
      }
      const nvidiaClient = createOpenAI({
        apiKey: nimKey,
        baseURL: NIM_BASE_URL,
      });
      aiModel = nvidiaClient(normalizedModel);
    }

    const { text } = await generateText({
      model: aiModel,
      system: "You are a world-class UI designer that outputs strict JSON for a component builder. Focus on unique, non-standard layouts while keeping the schema valid.",
      prompt,
      temperature: 1.0, 
    });

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    const variation = JSON.parse(cleanedText);

    // Calculate design checksum for deduplication
    const checksum = crypto
      .createHash("sha256")
      .update(JSON.stringify(variation.blueprint))
      .digest("hex");

    // Check if we already have this design (extremely unlikely with high temp but good for safety)
    const existing = await prisma.componentVariation.findUnique({
      where: { checksum }
    });

    if (existing) {
      return NextResponse.json({ 
        ...existing.designData as any,
        checksum,
        isCached: true 
      });
    }

    // Save to database
    const saved = await prisma.componentVariation.create({
      data: {
        baseType: componentType,
        designData: variation as any,
        checksum,
        modelUsed: normalizedModel,
      }
    });

    return NextResponse.json({
      ...variation,
      id: saved.id,
      checksum,
      generatedBy: normalizedModel,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Variation Generation Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate variation" },
      { status: 500 }
    );
  }
}
