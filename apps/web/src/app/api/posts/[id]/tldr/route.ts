import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { POST_LIMITS, READING_CONFIG } from '@hyperhub/shared'
import type { TldrResponse } from '@hyperhub/shared'

type RouteParams = { params: { id: string } }

// ============================================================
// POST /api/posts/[id]/tldr -- Generar resumen IA (con cache)
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

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        toneTag: true,
        wordCount: true,
        tldrSummary: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Check minimum word count
    if (post.wordCount < POST_LIMITS.tldrMinWords) {
      return NextResponse.json(
        { success: false, error: 'El post es demasiado corto para resumir' },
        { status: 400 }
      )
    }

    // Return cached TL;DR if available
    if (post.tldrSummary) {
      const cached = JSON.parse(post.tldrSummary) as TldrResponse
      return NextResponse.json({
        success: true,
        data: cached,
        message: 'Resumen cacheado',
      })
    }

    // Generate TL;DR with OpenAI
    const summary = await generateTldr(post)

    // Cache the result
    await prisma.post.update({
      where: { id: postId },
      data: { tldrSummary: JSON.stringify(summary) },
    })

    return NextResponse.json({
      success: true,
      data: summary,
      message: 'Resumen generado!',
    })
  } catch (error) {
    console.error('POST /api/posts/[id]/tldr error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar resumen' },
      { status: 500 }
    )
  }
}

// ============================================================
// GET /api/posts/[id]/tldr -- Obtener resumen existente
// ============================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = params

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { tldrSummary: true, wordCount: true },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    if (!post.tldrSummary) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No hay resumen disponible. Usa POST para generarlo.',
      })
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(post.tldrSummary),
    })
  } catch (error) {
    console.error('GET /api/posts/[id]/tldr error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener resumen' },
      { status: 500 }
    )
  }
}

// ============================================================
// OpenAI TL;DR Generation
// ============================================================

async function generateTldr(post: {
  id: string
  title: string | null
  content: string
  toneTag: string
  wordCount: number
}): Promise<TldrResponse> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    // Fallback: Generate a simple extractive summary
    return generateFallbackTldr(post)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente de resumen para HyperHub, una red social para personas neurodivergentes.
Tu trabajo es crear resumenes accesibles y amigables. Reglas:
- Escribe en espanol informal pero respetuoso
- Usa oraciones cortas y claras
- Respeta el tono original del post (${post.toneTag})
- Si es un INFO_DUMP, celebra el conocimiento compartido
- Si es un RANT/desahogo, valida los sentimientos
- Maximo 3 puntos clave
- Responde SOLO en JSON valido`,
          },
          {
            role: 'user',
            content: `Resume este post en formato JSON:
{"summary": "resumen de 1-2 oraciones", "keyPoints": ["punto 1", "punto 2", "punto 3"]}

Titulo: ${post.title || '(sin titulo)'}
Contenido: ${post.content}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return generateFallbackTldr(post)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return generateFallbackTldr(post)
    }

    const parsed = JSON.parse(content)
    const readingTimeSeconds = Math.ceil(post.wordCount / (READING_CONFIG.wordsPerMinute / 60))

    return {
      postId: post.id,
      summary: parsed.summary || 'No se pudo generar un resumen',
      keyPoints: parsed.keyPoints || [],
      readingTimeSeconds,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('OpenAI generation error:', error)
    return generateFallbackTldr(post)
  }
}

// ============================================================
// Fallback: Extractive summary (no API needed)
// ============================================================

function generateFallbackTldr(post: {
  id: string
  content: string
  wordCount: number
}): TldrResponse {
  const sentences = post.content
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)

  // Take first 3 meaningful sentences as key points
  const keyPoints = sentences.slice(0, 3)

  // First sentence as summary
  const summary = sentences[0] || post.content.slice(0, 200) + '...'

  const readingTimeSeconds = Math.ceil(post.wordCount / (READING_CONFIG.wordsPerMinute / 60))

  return {
    postId: post.id,
    summary,
    keyPoints,
    readingTimeSeconds,
    generatedAt: new Date().toISOString(),
  }
}
