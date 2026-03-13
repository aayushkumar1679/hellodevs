import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateNextJsProject } from "@/utils/exporter";
import JSZip from "jszip";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    // Prepare data for exporter
    const canvasProject = {
      id: project.id,
      name: project.name,
      components: project.components as any,
      designElements: (project as any).designElements as any,
      rootOrder: project.rootOrder as any,
      rootComponent: project.rootComponent || null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };

    // Generate files
    const files = generateNextJsProject(canvasProject as any, canvasProject.designElements);

    // Create Zip
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file.content);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Return as downloadable file
    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, "_")}-export.zip"`,
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: error.message || "Failed to export" }, { status: 500 });
  }
}
