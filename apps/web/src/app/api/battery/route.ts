import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, BatteryUpdateRequest } from '@hyperhub/shared'

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
        socialBattery: true,
        batteryHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!user || !user.socialBattery) {
      return NextResponse.json(
        { success: false, error: 'Battery not found' } satisfies ApiResponse<never>,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        battery: user.socialBattery,
        history: user.batteryHistory,
      },
    })
  } catch (error) {
    console.error('[API] GET /api/battery error:', error)
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

    const body = (await request.json()) as BatteryUpdateRequest
    const { level, manualOverride } = body

    const validLevels = ['GREEN', 'YELLOW', 'RED', 'LURKER']
    if (!level || !validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, error: 'Invalid battery level' } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { socialBattery: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } satisfies ApiResponse<never>,
        { status: 404 }
      )
    }

    const previousLevel = user.socialBattery?.level || 'GREEN'

    // Update battery level
    const battery = await prisma.socialBattery.upsert({
      where: { userId: user.id },
      update: {
        level,
        manualOverride: manualOverride ?? true,
        lastLevelChange: new Date(),
        lastActivity: new Date(),
      },
      create: {
        userId: user.id,
        level,
        manualOverride: manualOverride ?? true,
      },
    })

    // Record history if level actually changed
    if (previousLevel !== level) {
      await prisma.batteryHistory.create({
        data: {
          userId: user.id,
          fromLevel: previousLevel,
          toLevel: level,
          reason: 'manual',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: battery,
      message: 'Battery level updated',
    })
  } catch (error) {
    console.error('[API] PUT /api/battery error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
