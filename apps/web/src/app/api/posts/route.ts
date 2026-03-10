import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@hyperhub/db'
import type { CreatePostRequest, FeedFilters, ApiResponse, FeedPage, PostPublic } from '@hyperhub/shared'
import { FEED_CONFIG, READING_CONFIG } from '@hyperhub/shared'
import { calculateDopamineScore } from '@/lib/dopamineCuration'

function estimateReadingTime(content: string): { seconds: number; wordCount: number } {
  const words = content.trim().split(/\s+/).length
  const seconds = Math.ceil((words / READING_CONFIG.averageWPM) * 60)
  return { seconds, wordCount: words }
}

// GET /api/posts - Feed with cursor pagination and dopamine curation
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    })
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(FEED_CONFIG.postsPerPage)),
      50
    )
    const toneTag = searchParams.get('toneTag')
    const tag = searchParams.get('tag')
    const sortBy = (searchParams.get('sortBy') || 'dopamine') as FeedFilters['sortBy']

    // Build where clause
    const where: any = {
      visibility: 'PUBLIC',
      ...(toneTag && { toneTag }),
      ...(tag && { postTags: { some: { tag: { name: tag } } } }),
    }

    // Fetch posts with extra for has_more check
    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
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

    const hasMore = posts.length > limit
    const sliced = hasMore ? posts.slice(0, limit) : posts

    // Get user's reactions for these posts
    const postIds = sliced.map((p) => p.id)
    const userReactions = await prisma.reaction.findMany({
      where: { userId: user.id, postId: { in: postIds } },
    })
    const userReactionMap = new Map<string, string[]>()
    userReactions.forEach((r) => {
      const existing = userReactionMap.get(r.postId) || []
      existing.push(r.type)
      userReactionMap.set(r.postId, existing)
    })

    // Map to PostPublic
    let feedPosts: PostPublic[] = sliced.map((post) => ({
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
      viewCount: post.viewCount,
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
      userReactions: (userReactionMap.get(post.id) || []) as any[],
      isBookmarked: post.bookmarks.length > 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }))

    // Apply dopamine curation if requested
    if (sortBy === 'dopamine' && user.profile) {
      feedPosts = feedPosts.sort((a, b) => {
        const scoreA = calculateDopamineScore(a, user.profile!.currentHyperfoci, [])
        const scoreB = calculateDopamineScore(b, user.profile!.currentHyperfoci, [])
        return scoreB - scoreA
      })
    } else if (sortBy === 'serendipity') {
      // Shuffle with weighted randomness
      feedPosts = feedPosts.sort(() => Math.random() - 0.5)
    }

    const response: FeedPage = {
      posts: feedPosts,
      nextCursor: hasMore ? sliced[sliced.length - 1].id : null,
      hasMore,
      totalEstimate: await prisma.post.count({ where }),
    }

    return NextResponse.json<ApiResponse<FeedPage>>({ success: true, data: response })
  } catch (error) {
    console.error('Feed error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al cargar el feed' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
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

    const body: CreatePostRequest = await request.json()

    // Validate required fields
    if (!body.content?.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'El contenido es obligatorio' },
        { status: 400 }
      )
    }
    if (!body.toneTag) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'La etiqueta de tono es obligatoria. Como te sientes con este post?' },
        { status: 400 }
      )
    }
    if (body.content.length > FEED_CONFIG.maxPostLength) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `El post no puede exceder ${FEED_CONFIG.maxPostLength} caracteres` },
        { status: 400 }
      )
    }

    const { seconds, wordCount } = estimateReadingTime(body.content)

    // Handle tags - create if they don't exist
    const tagConnections = body.tags?.slice(0, FEED_CONFIG.maxTagsPerPost) || []

    const post = await prisma.$transaction(async (tx) => {
      // Upsert tags
      const tagRecords = await Promise.all(
        tagConnections.map(async (tagName) => {
          const normalized = tagName.toLowerCase().trim()
          return tx.tag.upsert({
            where: { name: normalized },
            update: { usageCount: { increment: 1 } },
            create: { name: normalized, category: 'custom', usageCount: 1 },
          })
        })
      )

      // Create post
      const newPost = await tx.post.create({
        data: {
          authorId: user.id,
          content: body.content.trim(),
          toneTag: body.toneTag,
          visibility: body.visibility || 'PUBLIC',
          isAnonymous: body.isAnonymous || false,
          mediaUrls: body.mediaUrls?.slice(0, FEED_CONFIG.maxMediaUrls) || [],
          audioUrl: body.audioUrl || null,
          readingTimeSeconds: seconds,
          wordCount,
          postTags: {
            create: tagRecords.map((tag) => ({ tagId: tag.id })),
          },
        },
        include: {
          author: {
            include: {
              profile: { select: { displayName: true, avatarUrl: true, pronouns: true } },
              socialBattery: { select: { level: true } },
            },
          },
          postTags: { include: { tag: true } },
        },
      })

      return newPost
    })

    return NextResponse.json<ApiResponse<{ id: string; message: string }>>(
      {
        success: true,
        data: { id: post.id, message: 'Post creado!' },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al crear el post' },
      { status: 500 }
    )
  }
}