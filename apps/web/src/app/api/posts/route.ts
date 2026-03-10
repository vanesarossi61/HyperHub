import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { POST_LIMITS, FEED_CONFIG } from '@hyperhub/shared'
import type { CreatePostRequest, ApiResponse, PostPublic } from '@hyperhub/shared'

// ============================================================
// GET /api/posts -- Lista paginada con filtros
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    const { searchParams } = new URL(request.url)

    // Pagination
    const cursor = searchParams.get('cursor') || undefined
    const limit = Math.min(
      Number(searchParams.get('limit')) || FEED_CONFIG.defaultPageSize,
      FEED_CONFIG.maxPageSize
    )

    // Filters
    const toneTag = searchParams.get('toneTag') || undefined
    const hyperfocus = searchParams.get('hyperfocus') || undefined
    const authorId = searchParams.get('authorId') || undefined
    const search = searchParams.get('search') || undefined
    const isInfoDump = searchParams.get('isInfoDump')

    // Build where clause
    const where: any = {
      published: true,
    }

    if (toneTag) {
      where.toneTag = toneTag
    }

    if (hyperfocus) {
      where.hyperfoci = { has: hyperfocus }
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (isInfoDump !== null && isInfoDump !== undefined) {
      where.isInfoDump = isInfoDump === 'true'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get current user for reaction/bookmark status
    let currentUser: { id: string } | null = null
    if (clerkId) {
      currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      })
    }

    // Fetch posts
    const posts = await prisma.post.findMany({
      where,
      take: limit + 1, // +1 to check hasMore
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          include: {
            profile: { select: { displayName: true, avatarUrl: true, pronouns: true, currentHyperfoci: true } },
            socialBattery: { select: { level: true } },
          },
        },
        reactions: true,
        _count: { select: { comments: true, bookmarks: true } },
        ...(currentUser && {
          bookmarks: {
            where: { userId: currentUser.id },
            select: { id: true },
          },
        }),
      },
    })

    // Check if there are more results
    const hasMore = posts.length > limit
    const results = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore ? results[results.length - 1]?.id : null

    // Transform to PostPublic
    const postsPublic: PostPublic[] = results.map((post) => {
      // Aggregate reactions
      const reactionCounts = aggregateReactions(post.reactions)
      const userReactions = currentUser
        ? post.reactions
            .filter((r: any) => r.userId === currentUser!.id)
            .map((r: any) => r.type)
        : []

      return {
        id: post.id,
        author: {
          id: post.author.id,
          username: post.author.username,
          profile: post.author.profile ? {
            displayName: post.author.profile.displayName,
            bio: null,
            avatarUrl: post.author.profile.avatarUrl,
            pronouns: post.author.profile.pronouns,
            ageRange: null,
            timezone: null,
            languages: [],
            neurodivTypes: [],
            selfDiagnosed: false,
            comfortTopics: [],
            communicationStyle: null,
            currentMood: null,
            currentHyperfoci: post.author.profile.currentHyperfoci,
            onboardingStep: 'COMPLETED' as const,
            onboardingCompleted: true,
          } : null,
          socialBattery: post.author.socialBattery ? {
            level: post.author.socialBattery.level,
            manualOverride: false,
            autoDecayEnabled: false,
            decayRateMinutes: 0,
            lastLevelChange: '',
          } : null,
        },
        title: post.title,
        content: post.content,
        toneTag: post.toneTag,
        hyperfoci: post.hyperfoci,
        wordCount: post.wordCount,
        isInfoDump: post.isInfoDump,
        tldrSummary: post.tldrSummary,
        visibility: post.visibility,
        published: post.published,
        pinned: post.pinned,
        reactions: reactionCounts,
        userReactions,
        commentCount: post._count.comments,
        isBookmarked: currentUser ? (post as any).bookmarks?.length > 0 : false,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        posts: postsPublic,
        nextCursor,
        hasMore,
      },
    })
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener posts' },
      { status: 500 }
    )
  }
}

// ============================================================
// POST /api/posts -- Crear nuevo post
// ============================================================

export async function POST(request: NextRequest) {
  try {
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

    const body: CreatePostRequest = await request.json()

    // Validation
    if (!body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El contenido es obligatorio' },
        { status: 400 }
      )
    }

    if (!body.toneTag) {
      return NextResponse.json(
        { success: false, error: 'La etiqueta de tono es obligatoria (es parte de la comunicacion segura)' },
        { status: 400 }
      )
    }

    if (body.title && body.title.length > POST_LIMITS.maxTitleLength) {
      return NextResponse.json(
        { success: false, error: `El titulo no puede superar ${POST_LIMITS.maxTitleLength} caracteres` },
        { status: 400 }
      )
    }

    if (body.content.length > POST_LIMITS.maxContentLength) {
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

    // Calculate word count and auto-detect info dump
    const wordCount = body.content.trim().split(/\s+/).length
    const isInfoDump = wordCount >= POST_LIMITS.infoDumpThreshold

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        title: body.title?.trim() || null,
        content: body.content.trim(),
        toneTag: body.toneTag,
        hyperfoci: body.hyperfoci || [],
        visibility: body.visibility || 'PUBLIC',
        wordCount,
        isInfoDump,
      },
      include: {
        author: {
          include: {
            profile: { select: { displayName: true, avatarUrl: true, pronouns: true, currentHyperfoci: true } },
            socialBattery: { select: { level: true } },
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: post,
        message: isInfoDump
          ? 'Post creado! Se detecto como Info Dump -- los lectores podran usar el boton TL;DR'
          : 'Post publicado!',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear post' },
      { status: 500 }
    )
  }
}

// ============================================================
// Helpers
// ============================================================

function aggregateReactions(reactions: any[]) {
  const counts: Record<string, number> = {}
  for (const r of reactions) {
    counts[r.type] = (counts[r.type] || 0) + 1
  }
  return Object.entries(counts).map(([type, count]) => ({ type, count }))
}
