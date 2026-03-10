import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ToggleReactionRequest, ReactionTypeValue } from '@hyperhub/shared'

type RouteParams = { params: { id: string } }

const VALID_REACTIONS: ReactionTypeValue[] = [
  'SAME_HERE',
  'BRAIN_EXPLODE',
  'HYPERFOCUS',
  'SPOON_GIFT',
  'INFODUMP_THANKS',
  'HUG',
  'SENSORY_OVERLOAD',
]

// ============================================================
// GET /api/posts/[id]/reactions -- Obtener conteos de reacciones
// ============================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = params
    const { userId: clerkId } = await auth()

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Get all reactions for the post
    const reactions = await prisma.reaction.findMany({
      where: { postId },
      select: { type: true, userId: true },
    })

    // Aggregate counts
    const counts: Record<string, number> = {}
    for (const r of reactions) {
      counts[r.type] = (counts[r.type] || 0) + 1
    }

    // Get current user's reactions
    let userReactions: string[] = []
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      })
      if (user) {
        userReactions = reactions
          .filter((r) => r.userId === user.id)
          .map((r) => r.type)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reactions: Object.entries(counts).map(([type, count]) => ({ type, count })),
        userReactions,
        totalReactions: reactions.length,
      },
    })
  } catch (error) {
    console.error('GET /api/posts/[id]/reactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener reacciones' },
      { status: 500 }
    )
  }
}

// ============================================================
// POST /api/posts/[id]/reactions -- Toggle una reaccion
// ============================================================

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = params
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    const body: ToggleReactionRequest = await request.json()

    if (!body.type || !VALID_REACTIONS.includes(body.type)) {
      return NextResponse.json(
        { success: false, error: `Tipo de reaccion invalido. Opciones: ${VALID_REACTIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if reaction already exists (toggle)
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId_type: {
          postId,
          userId: user.id,
          type: body.type,
        },
      },
    })

    if (existingReaction) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      })

      return NextResponse.json({
        success: true,
        data: { action: 'removed', type: body.type },
        message: 'Reaccion removida',
      })
    } else {
      // Add reaction (toggle on)
      await prisma.reaction.create({
        data: {
          postId,
          userId: user.id,
          type: body.type,
        },
      })

      return NextResponse.json({
        success: true,
        data: { action: 'added', type: body.type },
        message: 'Reaccion agregada!',
      })
    }
  } catch (error) {
    console.error('POST /api/posts/[id]/reactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar reaccion' },
      { status: 500 }
    )
  }
}
