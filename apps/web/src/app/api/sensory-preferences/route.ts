import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, SensoryPreferencesUpdateRequest } from '@hyperhub/shared'
import { SENSORY_PRESETS } from '@hyperhub/shared'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { sensoryPreferences: true },
    })

    if (!user || !user.sensoryPreferences) {
      return NextResponse.json(
        { success: false, error: 'Sensory preferences not found' } satisfies ApiResponse<never>,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        preferences: user.sensoryPreferences,
        availablePresets: SENSORY_PRESETS,
      },
    })
  } catch (error) {
    console.error('[API] GET /api/sensory-preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const body = (await request.json()) as SensoryPreferencesUpdateRequest

    // Validate fontScale if provided
    if (body.fontScale !== undefined && (body.fontScale < 0.8 || body.fontScale > 1.5)) {
      return NextResponse.json(
        { success: false, error: 'Font scale must be between 0.8 and 1.5' } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } satisfies ApiResponse<never>,
        { status: 404 }
      )
    }

    const preferences = await prisma.sensoryPreferences.upsert({
      where: { userId: user.id },
      update: { ...body },
      create: {
        userId: user.id,
        ...body,
      },
    })

    return NextResponse.json({
      success: true,
      data: preferences,
      message: 'Sensory preferences updated',
    })
  } catch (error) {
    console.error('[API] PATCH /api/sensory-preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
