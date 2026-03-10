import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { POST_LIMITS } from '@hyperhub/shared'
import type { UpdatePostRequest } from '@hyperhub/shared'

type RouteParams = { params: { id: string } }

// ============================================================
// GET /api/posts/[id] -- Detalle de un post
// ============================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const { userId: clerkId } = await auth()

    // Get current user for personalized data
    let currentUser: { id: string } | null = null
    if (clerkId) {
      currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      })
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
                pronouns: true,
                currentHyperfoci: true,
                communicationStyle: true,
              },
            },
            socialBattery: { select: { level: true } },
          },
        },
        reactions: true,
        comments: {
          where: { parentId: null }, // Only top-level comments
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              include: {
                profile: { select: { displayName: true, avatarUrl: true, pronouns: true } },
                socialBattery: { select: { level: true } },
              },
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: {
                  include: {
                    profile: { select: { displayName: true, avatarUrl: true, pronouns: true } },
                    socialBattery: { select: { level: true } },
                  },
                },
                replies: {
                  orderBy: { createdAt: 'asc' },
                  include: {
                    author: {
                      include: {
                        profile: { select: { displayName: true, avatarUrl: true, pronouns: true } },
                        socialBattery: { select: { level: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: { select: { comments: true, bookmarks: true } },
        ...(currentUser && {
          bookmarks: {
            where: { userId: currentUser.id },
            select: { id: true },
          },
        }),
      },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Aggregate reactions
    const reactionCounts: Record<string, number> = {}
    for (const r of post.reactions) {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
    }

    const userReactions = currentUser
      ? post.reactions.filter((r) => r.userId === currentUser!.id).map((r) => r.type)
      : []

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        reactions: Object.entries(reactionCounts).map(([type, count]) => ({ type, count })),
        userReactions,
        commentCount: post._count.comments,
        isBookmarked: currentUser ? (post as any).bookmarks?.length > 0 : false,
      },
    })
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener post' },
      { status: 500 }
    )
  }
}

// ============================================================
// PATCH /api/posts/[id] -- Editar post (solo el autor)
// ============================================================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
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

    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Solo el autor puede editar este post' },
        { status: 403 }
      )
    }

    const body: UpdatePostRequest = await request.json()

    // Validation
    if (body.title !== undefined && body.title && body.title.length > POST_LIMITS.maxTitleLength) {
      return NextResponse.json(
        { success: false, error: `El titulo no puede superar ${POST_LIMITS.maxTitleLength} caracteres` },
        { status: 400 }
      )
    }

    if (body.content !== undefined && body.content.length > POST_LIMITS.maxContentLength) {
      return NextResponse.json(
        { success: false, error: `El contenido no puede superar ${POST_LIMITS.maxContentLength} caracteres` },
        { status: 400 }
      )
    }

    if (body.hyperfoci && body.hyperfoci.length > POST_LIMITS.maxHyperfociPerPost) {
      return NextResponse.json(
        { success: false, error: `Maximo ${POST_LIMITS.maxHyperfociPerPost} hiperfocos por post` },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title?.trim() || null
    if (body.content !== undefined) {
      updateData.content = body.content.trim()
      updateData.wordCount = body.content.trim().split(/\s+/).length
      updateData.isInfoDump = updateData.wordCount >= POST_LIMITS.infoDumpThreshold
      // Clear cached TL;DR if content changed
      updateData.tldrSummary = null
    }
    if (body.toneTag !== undefined) updateData.toneTag = body.toneTag
    if (body.hyperfoci !== undefined) updateData.hyperfoci = body.hyperfoci
    if (body.visibility !== undefined) updateData.visibility = body.visibility
    if (body.pinned !== undefined) updateData.pinned = body.pinned

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          include: {
            profile: { select: { displayName: true, avatarUrl: true, pronouns: true } },
            socialBattery: { select: { level: true } },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Post actualizado',
    })
  } catch (error) {
    console.error('PATCH /api/posts/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar post' },
      { status: 500 }
    )
  }
}

// ============================================================
// DELETE /api/posts/[id] -- Borrar post (solo el autor)
// ============================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
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

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    if (post.authorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Solo el autor puede borrar este post' },
        { status: 403 }
      )
    }

    // Cascade delete handles comments, reactions, bookmarks
    await prisma.post.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Post eliminado',
    })
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar post' },
      { status: 500 }
    )
  }
}
