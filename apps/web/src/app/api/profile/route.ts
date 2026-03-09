import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, ProfileUpdateRequest } from '@hyperhub/shared'
import { APP_CONFIG } from '@hyperhub/shared'

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
      include: {
        profile: true,
        sensoryPreferences: true,
        socialBattery: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } satisfies ApiResponse<never>,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('[API] GET /api/profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const body = (await request.json()) as ProfileUpdateRequest

    // Validate constraints
    if (body.displayName && body.displayName.length > APP_CONFIG.maxDisplayNameLength) {
      return NextResponse.json(
        { success: false, error: `Display name must be ${APP_CONFIG.maxDisplayNameLength} characters or less` } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    if (body.bio && body.bio.length > APP_CONFIG.maxBioLength) {
      return NextResponse.json(
        { success: false, error: `Bio must be ${APP_CONFIG.maxBioLength} characters or less` } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    if (body.currentHyperfoci && body.currentHyperfoci.length > APP_CONFIG.maxHyperfoci) {
      return NextResponse.json(
        { success: false, error: `Maximum ${APP_CONFIG.maxHyperfoci} active hyperfoci allowed` } satisfies ApiResponse<never>,
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

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...body,
      },
      create: {
        userId: user.id,
        ...body,
      },
    })

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile updated',
    })
  } catch (error) {
    console.error('[API] PUT /api/profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
