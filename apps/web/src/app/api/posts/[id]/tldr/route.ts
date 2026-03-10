import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@hyperhub/db'
import type { ApiResponse } from '@hyperhub/shared'
import { READING_CONFIG } from '@hyperhub/shared'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/posts/[id]/tldr - Generate or return cached TL;DR
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const post = await prisma.post.findUnique({
      where: { id },
      select: { content: true, tldrText: true, tldrGeneratedAt: true, wordCount: true },
    })

    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Return cached TL;DR if still valid
    if (post.tldrText && post.tldrGeneratedAt) {
      const cacheExpiry = new Date(post.tldrGeneratedAt)
      cacheExpiry.setHours(cacheExpiry.getHours() + READING_CONFIG.tldrCacheDurationHours)
      if (new Date() < cacheExpiry) {
        return NextResponse.json<ApiResponse<{ tldr: string; cached: boolean }>>({
          success: true,
          data: { tldr: post.tldrText, cached: true },
        })
      }
    }

    // Generate TL;DR
    // For now, use a simple extractive summary (first 2 sentences + key points)
    // TODO: Replace with OpenAI/Anthropic API call for better summaries
    const sentences = post.content
      .replace(/\n+/g, '. ')
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)

    let tldr: string
    if (sentences.length <= 2) {
      tldr = sentences.join('. ')
    } else {
      // Take first sentence and longest sentence (likely the main point)
      const sorted = [...sentences].sort((a, b) => b.length - a.length)
      const mainPoints = [sentences[0]]
      if (sorted[0] !== sentences[0]) {
        mainPoints.push(sorted[0])
      }
      tldr = mainPoints.join('. ')
    }

    // Truncate to max length
    if (tldr.length > READING_CONFIG.tldrMaxLength) {
      tldr = tldr.substring(0, READING_CONFIG.tldrMaxLength - 3) + '...'
    }

    // Cache the result
    await prisma.post.update({
      where: { id },
      data: { tldrText: tldr, tldrGeneratedAt: new Date() },
    })

    return NextResponse.json<ApiResponse<{ tldr: string; cached: boolean }>>({
      success: true,
      data: { tldr, cached: false },
    })
  } catch (error) {
    console.error('TL;DR error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Error al generar el resumen' },
      { status: 500 }
    )
  }
}