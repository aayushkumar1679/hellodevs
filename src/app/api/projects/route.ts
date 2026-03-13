import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
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

    const body = await req.json()
    const { id, name, ...canvasState } = body

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 })
    }

    // Default canvas state properties
    const defaultState = {
      components: {},
      rootOrder: [],
      rootComponent: null,
      generationPrompt: null,
      generationModel: null,
      generationSummary: null,
    }

    // Upsert project (Update if exists, Create if not)
    const project = await prisma.project.upsert({
      where: { id: id || "new-project-id" }, // prisma requires a string here even for empty
      update: {
        name,
        ...canvasState,
      },
      create: {
        name,
        userId: session.user.id,
        ...defaultState,
        ...canvasState,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error saving project:", error)
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 })
  }
}
