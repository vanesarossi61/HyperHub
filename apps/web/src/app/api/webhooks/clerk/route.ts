import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    username: string | null
    first_name: string | null
    last_name: string | null
    image_url: string | null
  }
}

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('[Webhook] Missing CLERK_WEBHOOK_SECRET')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get headers
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('[Webhook] Verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }

  // Handle events
  const eventType = event.type

  if (eventType === 'user.created') {
    const { id, email_addresses, username, first_name, image_url } = event.data
    const primaryEmail = email_addresses[0]?.email_address

    if (!primaryEmail) {
      return NextResponse.json(
        { error: 'No email found' },
        { status: 400 }
      )
    }

    try {
      await prisma.user.create({
        data: {
          clerkId: id,
          email: primaryEmail,
          username: username,
          profile: {
            create: {
              displayName: first_name || username || null,
              avatarUrl: image_url,
            },
          },
          sensoryPreferences: {
            create: {},
          },
          socialBattery: {
            create: {},
          },
        },
      })

      console.log(`[Webhook] Created user: ${primaryEmail}`)
    } catch (error) {
      console.error('[Webhook] Error creating user:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, username, image_url } = event.data
    const primaryEmail = email_addresses[0]?.email_address

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: primaryEmail,
          username: username,
          profile: {
            update: {
              avatarUrl: image_url,
            },
          },
        },
      })

      console.log(`[Webhook] Updated user: ${id}`)
    } catch (error) {
      console.error('[Webhook] Error updating user:', error)
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = event.data

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      })

      console.log(`[Webhook] Deleted user: ${id}`)
    } catch (error) {
      console.error('[Webhook] Error deleting user:', error)
    }
  }

  return NextResponse.json({ received: true })
}
