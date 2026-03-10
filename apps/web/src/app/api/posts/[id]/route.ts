import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@hyperhub/db'
import type { UpdatePostRequest, ApiResponse, PostPublic } from '@hyperhub/shared'
import { FEED_CONFIG, READING_CONFIG } from '@hyperhub/shared'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/posts/[id] - Get single post
export async function GET(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            profile: { select: { displayName: true, avatarUrl: true, pronouns: true } },
            socialBattery: { select: { level: true } },
          },
        },
        postTags: { include: { tag: true } },
        reactions: true,
        bookmarks: { where: { userId: user.id } },
      },
    })

    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Get user reactions
    const userReactions = await prisma.reaction.findMany({
      where: { userId: user.id, postId: id },
    })

    const postPublic: PostPublic = {
      id: post.id,
      author: {
        id: post.isAnonymous ? 'anonymous' : post.author.id,
        username: post.isAnonymous ? null : post.author.username,
        displayName: post.isAnonymous ? 'Anonimo' : post.author.profile?.displayName || null,
        avatarUrl: post.isAnonymous ? null : post.author.profile?.avatarUrl || null,
        batteryLevel: post.isAnonymous ? null : post.author.socialBattery?.level || null,
        pronouns: post.isAnonymous ? null : post.author.profile?.pronouns || null,
      },
      content: post.content,
      toneTag: post.toneTag,
      visibility: post.visibility,
      isAnonymous: post.isAnonymous,
      mediaUrls: post.mediaUrls,
      audioUrl: post.audioUrl,
      tldrText: post.tldrText,
      readingTimeSeconds: post.readingTimeSeconds,
      wordCount: post.wordCount,
      viewCount: post.viewCount + 1,
      reactionCount: post.reactionCount,
      bookmarkCount: post.bookmarkCount,
      tags: post.postTags.map((pt) => ({
        id: pt.tag.id,
        name: pt.tag.name,
        category: pt.tag.category,
        usageCount: pt.tag.usageCount,
      })),
      reactions: Object.entries(
        post.reactions.reduce((acc, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type: type as any, count })),
      userReactions: userReactions.map((r) => r.type) as any[],
      isBookmarked: post.bookmarks.length > 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }

    return NextResponse.json<ApiResponse<PostPublic>>({ success: true, data: postPublic })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al obtener el post' },
      { status: 500 }
    )
  }
}

// PATCH /api/posts/[id] - Update post (only author)
export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params
    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }
    if (post.authorId !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solo puedes editar tus propios posts' },
        { status: 403 }
      )
    }

    const body: UpdatePostRequest = await request.json()
    const updateData: any = {}

    if (body.content !== undefined) {
      if (body.content.length > FEED_CONFIG.maxPostLength) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: `El post no puede exceder ${FEED_CONFIG.maxPostLength} caracteres` },
          { status: 400 }
        )
      }
      updateData.content = body.content.trim()
      const words = body.content.trim().split(/\s+/).length
      updateData.wordCount = words
      updateData.readingTimeSeconds = Math.ceil((words / READING_CONFIG.averageWPM) * 60)
      // Invalidate cached TL;DR when content changes
      updateData.tldrText = null
      updateData.tldrGeneratedAt = null
    }
    if (body.toneTag !== undefined) updateData.toneTag = body.toneTag
    if (body.visibility !== undefined) updateData.visibility = body.visibility
    if (body.isAnonymous !== undefined) updateData.isAnonymous = body.isAnonymous
    if (body.mediaUrls !== undefined) updateData.mediaUrls = body.mediaUrls.slice(0, FEED_CONFIG.maxMediaUrls)
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl

    // Handle tag updates
    if (body.tags !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId: id } })
      const tagRecords = await Promise.all(
        body.tags.slice(0, FEED_CONFIG.maxTagsPerPost).map(async (tagName) => {
          const normalized = tagName.toLowerCase().trim()
          return prisma.tag.upsert({
            where: { name: normalized },
            update: { usageCount: { increment: 1 } },
            create: { name: normalized, category: 'custom', usageCount: 1 },
          })
        })
      )
      updateData.postTags = { create: tagRecords.map((tag) => ({ tagId: tag.id })) }
    }

    await prisma.post.update({ where: { id }, data: updateData })

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: 'Post actualizado' },
    })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al actualizar el post' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete post (only author)
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params
    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }
    if (post.authorId !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Solo puedes eliminar tus propios posts' },
        { status: 403 }
      )
    }

    await prisma.post.delete({ where: { id } })

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: 'Post eliminado' },
    })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al eliminar el post' },
      { status: 500 }
    )
  }
}