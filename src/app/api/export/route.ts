import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNextJsProject } from "@/utils/exporter";
import { generateExport, type TechStack } from "@/utils/exportGenerators";
import { normalizeProject } from "@/utils/projectModel";
import JSZip from "jszip";
import type { PolyglotProject } from "@/state/useProjectStore";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      projectId,
      format = "react-tailwind",
    } = (await req.json()) as {
      projectId?: string;
      format?: TechStack;
    };

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const canvasProject = normalizeProject({
      id: project.id,
      name: project.name,
      components: (project.components ?? {}) as unknown as PolyglotProject["components"],
      rootOrder: (project.rootOrder ?? []) as unknown as string[],
      rootComponent: project.rootComponent || null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    } as PolyglotProject);

    const files =
      format === "react-tailwind"
        ? generateNextJsProject(canvasProject)
        : (() => {
            const exported = generateExport(
              canvasProject,
              format
            );

            return [
              {
                name: exported.fileName,
                content: exported.code,
              },
              {
                name: "README.txt",
                content:
                  "This archive was exported from Polyglot. Open the generated file in your preferred stack to continue editing.",
              },
            ];
          })();

    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file.content);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, "_")}-export.zip"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to export",
      },
      { status: 500 }
    );
  }
}
