import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, BatteryConfigUpdateRequest } from '@hyperhub/shared'

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const body = (await request.json()) as BatteryConfigUpdateRequest

    // Validate decay rate if provided
    if (body.decayRateMinutes !== undefined && (body.decayRateMinutes < 30 || body.decayRateMinutes > 480)) {
      return NextResponse.json(
        { success: false, error: 'Decay rate must be between 30 and 480 minutes' } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/
    if (body.autoLurkerStart && !timeRegex.test(body.autoLurkerStart)) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format for autoLurkerStart (use HH:MM)' } satisfies ApiResponse<never>,
        { status: 400 }
      )
    }
    if (body.autoLurkerEnd && !timeRegex.test(body.autoLurkerEnd)) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format for autoLurkerEnd (use HH:MM)' } satisfies ApiResponse<never>,
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

    const battery = await prisma.socialBattery.upsert({
      where: { userId: user.id },
      update: { ...body },
      create: {
        userId: user.id,
        ...body,
      },
    })

    return NextResponse.json({
      success: true,
      data: battery,
      message: 'Battery configuration updated',
    })
  } catch (error) {
    console.error('[API] PUT /api/battery/config error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
