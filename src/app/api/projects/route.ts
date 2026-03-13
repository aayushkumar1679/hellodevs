import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { projectSchema } from "@/lib/validations"
import type { Project } from "@/state/useCanvasStore"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const result = projectSchema.safeParse(json)
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request data", details: result.error.format() }, { status: 400 })
    }

    const { id, name, ...canvasState } = result.data

    if (id) {
      const existing = await prisma.project.findUnique({
        where: { id },
        select: { userId: true },
      })

      if (existing && existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Default canvas state properties
    const defaultState = {
      components: {},
      designElements: {},
      rootOrder: [],
      rootComponent: null,
      generationPrompt: null,
      generationModel: null,
      generationSummary: null,
      isPublic: false,
    }

    const projectData = {
      name,
      components: canvasState.components ?? defaultState.components,
      designElements: canvasState.designElements ?? defaultState.designElements,
      rootOrder: canvasState.rootOrder ?? defaultState.rootOrder,
      rootComponent: canvasState.rootComponent ?? defaultState.rootComponent,
      generationPrompt: canvasState.generationPrompt ?? defaultState.generationPrompt,
      generationModel: canvasState.generationModel ?? defaultState.generationModel,
      generationSummary: canvasState.generationSummary ?? defaultState.generationSummary,
      isPublic: canvasState.isPublic ?? defaultState.isPublic,
    }

    const project = id
      ? await prisma.project.upsert({
          where: { id },
          update: projectData,
          create: {
            id,
            userId: session.user.id,
            ...projectData,
          },
        })
      : await prisma.project.create({
          data: {
            userId: session.user.id,
            ...projectData,
          },
        })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error saving project:", error)
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 })
  }
}
