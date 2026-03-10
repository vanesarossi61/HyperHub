import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@hyperhub/shared'

const VALID_STEPS = ['BASICS', 'HYPERFOCI', 'SENSORY', 'BATTERY_TUTORIAL', 'COMPLETED']

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } satisfies ApiResponse<never>,
        { status: 401 }
      )
    }

    const body = await request.json()
    const { step } = body

    if (!step || !VALID_STEPS.includes(step)) {
      return NextResponse.json(
        { success: false, error: 'Invalid onboarding step' } satisfies ApiResponse<never>,
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

    const isCompleted = step === 'COMPLETED'

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        onboardingStep: step,
        onboardingCompleted: isCompleted,
      },
      create: {
        userId: user.id,
        onboardingStep: step,
        onboardingCompleted: isCompleted,
      },
    })

    return NextResponse.json({
      success: true,
      data: { step: profile.onboardingStep, completed: profile.onboardingCompleted },
      message: isCompleted ? 'Onboarding completed!' : `Progress saved: ${step}`,
    })
  } catch (error) {
    console.error('[API] PUT /api/onboarding/progress error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } satisfies ApiResponse<never>,
      { status: 500 }
    )
  }
}
