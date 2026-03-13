import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
