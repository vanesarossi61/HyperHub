// ============================================================
// Phase 4: Seed Data for Messaging System
// packages/db/prisma/seed-phase4.ts
// ============================================================

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPhase4() {
  console.log('Seeding Phase 4: Messaging System...')

  // Get existing users from Phase 1-3 seed
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'asc' },
    select: { id: true, username: true },
  })

  if (users.length < 3) {
    console.log('Need at least 3 users. Run Phase 1-3 seed first.')
    return
  }

  const [user1, user2, user3, user4, user5] = users
  console.log(`Using users: ${users.map((u) => u.username).join(', ')}`)

  // ----------------------------------------------------------
  // 1. Notification Preferences
  // ----------------------------------------------------------

  for (const user of users) {
    await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        greenBattery: 'NORMAL',
        yellowBattery: 'LOW',
        redBattery: 'SILENT',
        lurkerBattery: 'SILENT',
        quietHoursEnabled: false,
        digestEnabled: true,
        digestIntervalMin: 30,
      },
      update: {},
    })
  }
  console.log('Created notification preferences for all users')

  // ----------------------------------------------------------
  // 2. Direct Conversation: user1 <-> user2
  // ----------------------------------------------------------

  const directConv = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      maxMembers: 2,
      toneTagRequired: true,
      slowModeSeconds: 0,
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: user1!.id, role: 'OWNER' },
          { userId: user2!.id, role: 'MEMBER' },
        ],
      },
    },
  })
  console.log(`Created direct conversation: ${directConv.id}`)

  // Messages for direct conversation
  const directMessages = [
    { senderId: user1!.id, content: 'Hey! Have you tried the new sensory profile settings?', toneTag: 'ENTHUSIASM', isSystem: false },
    { senderId: user2!.id, content: 'Not yet! What changed?', toneTag: 'QUESTION', isSystem: false },
    { senderId: user1!.id, content: 'They added granular animation controls. You can set tolerance per-component now instead of globally. It is a game changer for visual processing differences.', toneTag: 'INFO_DUMP', isSystem: false },
    { senderId: user2!.id, content: 'That sounds amazing. I have been struggling with the feed animations triggering my sensory overload. The global toggle was too blunt.', toneTag: 'RANT', isSystem: false },
    { senderId: user1!.id, content: 'Exactly! Check Settings > Sensory > Animation Tolerance. You can even preview each level before committing.', toneTag: 'HELP', isSystem: false },
    { senderId: user2!.id, content: 'Going to try it right now. Thanks for the heads up!', toneTag: 'ENTHUSIASM', isSystem: false },
    { senderId: user1!.id, content: 'Let me know how it goes. The contrast mode pairs well with reduced animations too.', toneTag: 'INFO_DUMP', isSystem: false },
  ]

  for (let i = 0; i < directMessages.length; i++) {
    const msg = directMessages[i]!
    await prisma.message.create({
      data: {
        conversationId: directConv.id,
        senderId: msg.senderId,
        content: msg.content,
        toneTag: msg.toneTag,
        status: 'DELIVERED',
        isSystem: msg.isSystem,
        createdAt: new Date(Date.now() - (directMessages.length - i) * 120000), // 2 min apart
      },
    })
  }
  console.log(`Created ${directMessages.length} messages in direct conversation`)

  // ----------------------------------------------------------
  // 3. Group Conversation: Neurodiversity Study Group
  // ----------------------------------------------------------

  const groupConv = await prisma.conversation.create({
    data: {
      type: 'GROUP',
      name: 'Neurodiversity Study Group',
      description: 'Sharing resources and strategies for neurodivergent learners',
      maxMembers: 20,
      toneTagRequired: true,
      slowModeSeconds: 30, // 30s slow mode
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: user1!.id, role: 'OWNER' },
          { userId: user2!.id, role: 'ADMIN' },
          { userId: user3!.id, role: 'MEMBER' },
          ...(user4 ? [{ userId: user4.id, role: 'MEMBER' as const }] : []),
        ],
      },
    },
  })
  console.log(`Created group conversation: ${groupConv.id}`)

  const groupMessages = [
    { senderId: user1!.id, content: 'Welcome to the study group! Tone tags are required here so we always know how messages are intended.', toneTag: 'ENTHUSIASM', isSystem: false },
    { senderId: user3!.id, content: 'Glad to be here. Quick question -- is there a way to set quiet hours for this group? I get overwhelmed by notifications during focus time.', toneTag: 'QUESTION', isSystem: false },
    { senderId: user2!.id, content: 'Yes! Go to your notification preferences and enable Quiet Hours. You can set specific times when notifications are silenced. Also, your battery level automatically adjusts notification priority.', toneTag: 'HELP', isSystem: false },
    { senderId: user1!.id, content: 'I want to share something that has been frustrating me. The standard study apps never account for different processing speeds. They assume everyone reads and absorbs at the same rate.', toneTag: 'RANT', isSystem: false },
    { senderId: user3!.id, content: 'SO true. I need to re-read things 3-4 times sometimes and it is not because I do not understand -- my brain just processes text differently.', toneTag: 'DEBATE', isSystem: false },
    { senderId: user2!.id, content: 'That is exactly why HyperHub exists. The battery system respects your pace. When you are RED, messages queue instead of bombarding you.', toneTag: 'INFO_DUMP', isSystem: false },
    { senderId: user1!.id, content: 'Found a great article on spaced repetition adapted for ADHD brains. Sharing in the resources channel too.', toneTag: 'ENTHUSIASM', isSystem: false },
  ]

  for (let i = 0; i < groupMessages.length; i++) {
    const msg = groupMessages[i]!
    await prisma.message.create({
      data: {
        conversationId: groupConv.id,
        senderId: msg.senderId,
        content: msg.content,
        toneTag: msg.toneTag,
        status: 'DELIVERED',
        isSystem: msg.isSystem,
        createdAt: new Date(Date.now() - (groupMessages.length - i) * 300000), // 5 min apart (slow mode)
      },
    })
  }
  console.log(`Created ${groupMessages.length} messages in group conversation`)

  // ----------------------------------------------------------
  // 4. Safe Space Conversation
  // ----------------------------------------------------------

  const safeSpaceConv = await prisma.conversation.create({
    data: {
      type: 'SAFE_SPACE',
      name: 'Decompression Zone',
      description: 'A low-stimulation space for when you need to decompress. No pressure to respond.',
      maxMembers: 10,
      toneTagRequired: true,
      slowModeSeconds: 60, // 1 min slow mode for extra calmness
      lastMessageAt: new Date(),
      participants: {
        create: [
          { userId: user2!.id, role: 'OWNER' },
          { userId: user1!.id, role: 'MEMBER' },
          { userId: user3!.id, role: 'MEMBER' },
        ],
      },
    },
  })
  console.log(`Created safe space: ${safeSpaceConv.id}`)

  const safeMessages = [
    { senderId: user2!.id, content: 'This space has 60-second slow mode. Take your time. No rush to respond to anything.', toneTag: 'HELP', isSystem: false },
    { senderId: user1!.id, content: 'Had a really overwhelming day. Just needed somewhere quiet to exist for a bit.', toneTag: 'RANT', isSystem: false },
    { senderId: user3!.id, content: 'Same here. The sensory overload from the office was intense today. Grateful for spaces like this.', toneTag: 'HELP', isSystem: false },
    { senderId: user2!.id, content: 'You are both welcome here anytime. Remember you can use the Safe Exit button if you need to step away -- no explanation needed.', toneTag: 'ENTHUSIASM', isSystem: false },
  ]

  for (let i = 0; i < safeMessages.length; i++) {
    const msg = safeMessages[i]!
    await prisma.message.create({
      data: {
        conversationId: safeSpaceConv.id,
        senderId: msg.senderId,
        content: msg.content,
        toneTag: msg.toneTag,
        status: 'DELIVERED',
        isSystem: msg.isSystem,
        createdAt: new Date(Date.now() - (safeMessages.length - i) * 600000), // 10 min apart
      },
    })
  }
  console.log(`Created ${safeMessages.length} messages in safe space`)

  // ----------------------------------------------------------
  // 5. Safe Exit example
  // ----------------------------------------------------------

  const safeExit = await prisma.safeExit.create({
    data: {
      userId: user3!.id,
      conversationId: safeSpaceConv.id,
      reason: 'SENSORY_OVERLOAD',
      customMessage: null,
      autoMessage: 'Sensory overload -- stepping away to decompress',
      exitedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      returnedAt: new Date(Date.now() - 10 * 60 * 1000), // Returned 10 min ago
    },
  })
  console.log(`Created safe exit example: ${safeExit.id}`)

  // System message for safe exit
  await prisma.message.create({
    data: {
      conversationId: safeSpaceConv.id,
      senderId: user3!.id,
      content: 'Sensory overload -- stepping away to decompress',
      toneTag: 'HELP',
      isSystem: true,
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  })

  // Return message
  await prisma.message.create({
    data: {
      conversationId: safeSpaceConv.id,
      senderId: user3!.id,
      content: 'Returned from break -- hey!',
      toneTag: 'ENTHUSIASM',
      isSystem: true,
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  })
  console.log('Created safe exit system messages')

  // ----------------------------------------------------------
  // 6. Read Receipts
  // ----------------------------------------------------------

  const recentMessages = await prisma.message.findMany({
    where: { conversationId: directConv.id, senderId: user1!.id },
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

  for (const msg of recentMessages) {
    await prisma.messageRead.create({
      data: { messageId: msg.id, userId: user2!.id },
    })
  }
  console.log(`Created ${recentMessages.length} read receipts`)

  // ----------------------------------------------------------
  // 7. Queued Message (battery-delayed)
  // ----------------------------------------------------------

  if (user5) {
    // Create a conversation where user5 has RED battery
    const queueConv = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
        maxMembers: 2,
        toneTagRequired: true,
        participants: {
          create: [
            { userId: user1!.id, role: 'OWNER' },
            { userId: user5.id, role: 'MEMBER' },
          ],
        },
      },
    })

    await prisma.message.create({
      data: {
        conversationId: queueConv.id,
        senderId: user1!.id,
        content: 'Hey, whenever you are feeling up to it -- no rush! Just wanted to share something cool I found.',
        toneTag: 'ENTHUSIASM',
        status: 'QUEUED', // Battery-delayed
        isSystem: false,
      },
    })
    console.log('Created queued message example (battery-delayed)')
  }

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------

  const convCount = await prisma.conversation.count()
  const msgCount = await prisma.message.count()
  const exitCount = await prisma.safeExit.count()
  const readCount = await prisma.messageRead.count()
  const prefCount = await prisma.notificationPreference.count()

  console.log('\n--- Phase 4 Seed Summary ---')
  console.log(`Conversations: ${convCount}`)
  console.log(`Messages: ${msgCount}`)
  console.log(`Safe Exits: ${exitCount}`)
  console.log(`Read Receipts: ${readCount}`)
  console.log(`Notification Preferences: ${prefCount}`)
  console.log('Phase 4 seeding complete!')
}

seedPhase4()
  .catch((e) => {
    console.error('Phase 4 seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })