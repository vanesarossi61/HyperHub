import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ToggleBookmarkRequest } from '@hyperhub/shared'

type RouteParams = { params: { id: string } }

// ============================================================
// POST /api/posts/[id]/bookmark -- Toggle bookmark
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
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    const body: ToggleBookmarkRequest = await request.json().catch(() => ({}))

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    if (existingBookmark) {
      // Remove bookmark (toggle off)
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      })

      return NextResponse.json({
        success: true,
        data: { action: 'removed', postId },
        message: 'Bookmark removido',
      })
    } else {
      // Add bookmark (toggle on)
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: user.id,
          postId,
          folder: body.folder || null,
        },
      })

      return NextResponse.json({
        success: true,
        data: { action: 'added', postId, bookmarkId: bookmark.id },
        message: 'Guardado en bookmarks!',
      })
    }
  } catch (error) {
    console.error('POST /api/posts/[id]/bookmark error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar bookmark' },
      { status: 500 }
    )
  }
}

// ============================================================
// GET /api/posts/[id]/bookmark -- Check bookmark status
// ============================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = params
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({
        success: true,
        data: { isBookmarked: false },
      })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({
        success: true,
        data: { isBookmarked: false },
      })
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        isBookmarked: !!bookmark,
        folder: bookmark?.folder || null,
      },
    })
  } catch (error) {
    console.error('GET /api/posts/[id]/bookmark error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar bookmark' },
      { status: 500 }
    )
  }
}
