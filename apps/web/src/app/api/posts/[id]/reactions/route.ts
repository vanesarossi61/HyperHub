import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@hyperhub/db'
import type { ToggleReactionRequest, ApiResponse } from '@hyperhub/shared'

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/posts/[id]/reactions - Toggle reaction (add/remove)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const { id: postId } = await context.params
    const body: ToggleReactionRequest = await request.json()

    if (!body.type) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Tipo de reaccion requerido' },
        { status: 400 }
      )
    }

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Toggle: if exists, remove; if not, add
    const existing = await prisma.reaction.findUnique({
      where: { postId_userId_type: { postId, userId: user.id, type: body.type } },
    })

    if (existing) {
      await prisma.$transaction([
        prisma.reaction.delete({ where: { id: existing.id } }),
        prisma.post.update({
          where: { id: postId },
          data: { reactionCount: { decrement: 1 } },
        }),
      ])
      return NextResponse.json<ApiResponse<{ action: string; type: string }>>({
        success: true,
        data: { action: 'removed', type: body.type },
      })
    } else {
      await prisma.$transaction([
        prisma.reaction.create({
          data: { postId, userId: user.id, type: body.type },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { reactionCount: { increment: 1 } },
        }),
      ])
      return NextResponse.json<ApiResponse<{ action: string; type: string }>>(
        { success: true, data: { action: 'added', type: body.type } },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al procesar la reaccion' },
      { status: 500 }
    )
  }
}