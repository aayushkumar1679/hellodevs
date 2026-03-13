import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project || !project.isPublic) {
    return NextResponse.json({ error: "Project not found or not public" }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    name: project.name,
    components: project.components,
    designElements: project.designElements,
    rootOrder: project.rootOrder,
    rootComponent: project.rootComponent,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  });
}
