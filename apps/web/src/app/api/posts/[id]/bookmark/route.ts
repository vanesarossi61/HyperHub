import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@hyperhub/db'
import type { ToggleBookmarkRequest, ApiResponse } from '@hyperhub/shared'

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/posts/[id]/bookmark - Toggle bookmark
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
    const body: ToggleBookmarkRequest = await request.json().catch(() => ({}))

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    const existing = await prisma.bookmark.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    })

    if (existing) {
      await prisma.$transaction([
        prisma.bookmark.delete({ where: { id: existing.id } }),
        prisma.post.update({
          where: { id: postId },
          data: { bookmarkCount: { decrement: 1 } },
        }),
      ])
      return NextResponse.json<ApiResponse<{ action: string }>>({
        success: true,
        data: { action: 'removed' },
      })
    } else {
      // Validate folder if provided
      if (body.folderId) {
        const folder = await prisma.bookmarkFolder.findFirst({
          where: { id: body.folderId, userId: user.id },
        })
        if (!folder) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Carpeta no encontrada' },
            { status: 404 }
          )
        }
      }

      await prisma.$transaction([
        prisma.bookmark.create({
          data: { postId, userId: user.id, folderId: body.folderId || null },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { bookmarkCount: { increment: 1 } },
        }),
      ])
      return NextResponse.json<ApiResponse<{ action: string }>>(
        { success: true, data: { action: 'added' } },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Bookmark error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al procesar el bookmark' },
      { status: 500 }
    )
  }
}