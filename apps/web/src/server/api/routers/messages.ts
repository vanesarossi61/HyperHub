// ============================================================
// Phase 4: Messaging API Routes (tRPC Router)
// apps/web/src/server/api/routers/messages.ts
// ============================================================

import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'
import type {
  ConversationPublic,
  ConversationDetail,
  MessagePublic,
  SafeExitPublic,
  SafeExitStatus,
  NotificationPreferencePublic,
  MessageQueueStatus,
} from '@hyperhub/shared'

// ============================================================
// Zod Schemas
// ============================================================

const conversationTypeSchema = z.enum(['DIRECT', 'GROUP', 'SAFE_SPACE'])
const toneTagSchema = z.enum(['ENTHUSIASM', 'RANT', 'DEBATE', 'INFO_DUMP', 'QUESTION', 'HELP'])
const participantRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER'])
const safeExitReasonSchema = z.enum(['NEED_BREAK', 'SENSORY_OVERLOAD', 'LOW_BATTERY', 'OVERWHELMED', 'CUSTOM'])
const notificationPrioritySchema = z.enum(['SILENT', 'LOW', 'NORMAL', 'URGENT'])

const createConversationSchema = z.object({
  type: conversationTypeSchema,
  participantIds: z.array(z.string()).min(1).max(20),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  toneTagRequired: z.boolean().default(true),
  slowModeSeconds: z.number().min(0).max(300).default(0),
})

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(5000),
  toneTag: toneTagSchema,
  replyToId: z.string().optional(),
})

const editMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().min(1).max(5000),
  toneTag: toneTagSchema.optional(),
})

const safeExitSchema = z.object({
  reason: safeExitReasonSchema,
  customMessage: z.string().max(500).optional(),
  conversationId: z.string().optional(),
  plannedReturn: z.string().optional(),
})

const updateNotifPrefsSchema = z.object({
  greenBattery: notificationPrioritySchema.optional(),
  yellowBattery: notificationPrioritySchema.optional(),
  redBattery: notificationPrioritySchema.optional(),
  lurkerBattery: notificationPrioritySchema.optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  digestEnabled: z.boolean().optional(),
  digestIntervalMin: z.number().min(5).max(1440).optional(),
  newMessageEnabled: z.boolean().optional(),
  mentionEnabled: z.boolean().optional(),
  reactionEnabled: z.boolean().optional(),
  safeExitEnabled: z.boolean().optional(),
})

// ============================================================
// Helpers
// ============================================================

async function getBatteryLevel(db: any, userId: string) {
  const b = await db.socialBattery.findUnique({ where: { userId }, select: { level: true } })
  return (b?.level as 'GREEN' | 'YELLOW' | 'RED' | 'LURKER') ?? 'GREEN'
}

async function isOnSafeExit(db: any, userId: string, convId?: string) {
  const exit = await db.safeExit.findFirst({
    where: {
      userId, returnedAt: null,
      ...(convId ? { OR: [{ conversationId: convId }, { conversationId: null }] } : {}),
    },
  })
  return !!exit
}

const SAFE_EXIT_MSGS: Record<string, string> = {
  NEED_BREAK: 'Taking a break -- will be back when ready',
  SENSORY_OVERLOAD: 'Sensory overload -- stepping away to decompress',
  LOW_BATTERY: 'Social battery low -- recharging',
  OVERWHELMED: 'Feeling overwhelmed -- need some space',
  CUSTOM: 'Taking a pause',
}

// Shared includes for user data
const userInclude = {
  profile: { select: { displayName: true, avatarUrl: true } },
  socialBattery: { select: { level: true } },
}

function mapParticipant(p: any) {
  return {
    id: p.id,
    user: { id: p.user.id, username: p.user.username, profile: p.user.profile, socialBattery: p.user.socialBattery },
    role: p.role, nickname: p.nickname ?? null, muted: p.muted ?? false,
    pinned: p.pinned ?? false, lastReadAt: p.lastReadAt?.toISOString() ?? null,
    joinedAt: p.joinedAt.toISOString(), isOnline: false, isTyping: false,
  }
}

function mapMessage(msg: any): MessagePublic {
  return {
    id: msg.id, conversationId: msg.conversationId,
    sender: { id: msg.sender.id, username: msg.sender.username, profile: msg.sender.profile, socialBattery: null },
    content: msg.content, toneTag: msg.toneTag, status: msg.status,
    replyTo: msg.replyTo ? {
      id: msg.replyTo.id,
      sender: { id: msg.replyTo.sender.id, username: msg.replyTo.sender.username, displayName: msg.replyTo.sender.profile?.displayName ?? null },
      content: msg.replyTo.content.substring(0, 100), toneTag: msg.replyTo.toneTag,
    } : null,
    editedAt: msg.editedAt?.toISOString() ?? null, isSystem: msg.isSystem,
    reads: (msg.reads ?? []).map((r: any) => ({ userId: r.user.id, username: r.user.username, readAt: r.readAt.toISOString() })),
    createdAt: msg.createdAt.toISOString(),
  }
}

const msgInclude = {
  sender: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
  replyTo: { include: { sender: { include: { profile: { select: { displayName: true } } } } } },
  reads: { include: { user: { select: { id: true, username: true } } } },
}

// ============================================================
// Router
// ============================================================

export const messagesRouter = createTRPCRouter({

  // --- CONVERSATIONS ---

  getConversations: protectedProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(50).default(20), type: conversationTypeSchema.optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { cursor, limit, type } = input

      const convs = await ctx.db.conversation.findMany({
        where: { isActive: true, participants: { some: { userId, leftAt: null } }, ...(type ? { type } : {}) },
        include: {
          participants: { where: { leftAt: null }, include: { user: { include: userInclude } } },
          messages: { take: 1, orderBy: { createdAt: 'desc' }, include: { sender: { include: { profile: { select: { displayName: true, avatarUrl: true } } } } } },
        },
        orderBy: { lastMessageAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      })

      let nextCursor: string | undefined
      if (convs.length > limit) { nextCursor = convs.pop()!.id }

      const result = await Promise.all(convs.map(async (c) => {
        const me = c.participants.find((p) => p.userId === userId)
        const unread = me ? await ctx.db.message.count({
          where: { conversationId: c.id, createdAt: { gt: me.lastReadAt ?? new Date(0) }, senderId: { not: userId }, isSystem: false },
        }) : 0

        const last = c.messages[0]
        return {
          id: c.id, type: c.type, name: c.name, description: c.description, avatarUrl: c.avatarUrl,
          maxMembers: c.maxMembers, toneTagRequired: c.toneTagRequired, slowModeSeconds: c.slowModeSeconds,
          isActive: c.isActive, lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
          participants: c.participants.map(mapParticipant),
          lastMessage: last ? {
            id: last.id, conversationId: c.id,
            sender: { id: last.sender.id, username: last.sender.username, profile: last.sender.profile, socialBattery: null },
            content: last.content.substring(0, 100), toneTag: last.toneTag, status: last.status,
            replyTo: null, editedAt: last.editedAt?.toISOString() ?? null, isSystem: last.isSystem, reads: [],
            createdAt: last.createdAt.toISOString(),
          } : null,
          unreadCount: unread, createdAt: c.createdAt.toISOString(),
        } satisfies ConversationPublic
      }))

      return { conversations: result, nextCursor, hasMore: !!nextCursor }
    }),

  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string(), messageCursor: z.string().optional(), messageLimit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { conversationId, messageCursor, messageLimit } = input

      const me = await ctx.db.conversationParticipant.findFirst({ where: { conversationId, userId, leftAt: null } })
      if (!me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a participant' })

      const conv = await ctx.db.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: { where: { leftAt: null }, include: { user: { include: userInclude } } } },
      })
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' })

      const msgs = await ctx.db.message.findMany({
        where: { conversationId }, include: msgInclude,
        orderBy: { createdAt: 'desc' }, take: messageLimit + 1,
        ...(messageCursor ? { cursor: { id: messageCursor }, skip: 1 } : {}),
      })

      let hasMore = false
      if (msgs.length > messageLimit) { msgs.pop(); hasMore = true }

      await ctx.db.conversationParticipant.update({ where: { id: me.id }, data: { lastReadAt: new Date() } })

      return {
        id: conv.id, type: conv.type, name: conv.name, description: conv.description,
        avatarUrl: conv.avatarUrl, maxMembers: conv.maxMembers, toneTagRequired: conv.toneTagRequired,
        slowModeSeconds: conv.slowModeSeconds, isActive: conv.isActive,
        lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
        participants: conv.participants.map(mapParticipant),
        lastMessage: null, unreadCount: 0, createdAt: conv.createdAt.toISOString(),
        messages: msgs.reverse().map(mapMessage), hasMoreMessages: hasMore,
        nextCursor: hasMore ? msgs[0]?.id : null,
      } satisfies ConversationDetail
    }),

  create: protectedProcedure.input(createConversationSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const users = await ctx.db.user.findMany({ where: { id: { in: [...input.participantIds, userId] } }, select: { id: true } })
    const valid = new Set(users.map((u: any) => u.id))
    const all = [...new Set([userId, ...input.participantIds])].filter((id) => valid.has(id))

    if (input.type === 'DIRECT') {
      if (all.length !== 2) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Direct conversations need exactly 2 participants' })
      const existing = await ctx.db.conversation.findFirst({
        where: { type: 'DIRECT', isActive: true, AND: all.map((id) => ({ participants: { some: { userId: id, leftAt: null } } })) },
      })
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Direct conversation already exists' })
    }

    if (input.type !== 'DIRECT' && !input.name) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Group/Safe Space need a name' })

    const battery = await getBatteryLevel(ctx.db, userId)
    if (battery === 'LURKER') throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Cannot create conversations in LURKER mode' })

    const conv = await ctx.db.conversation.create({
      data: {
        type: input.type, name: input.name ?? null, description: input.description ?? null,
        maxMembers: input.type === 'DIRECT' ? 2 : 20, toneTagRequired: input.toneTagRequired,
        slowModeSeconds: input.slowModeSeconds,
        participants: { create: all.map((id) => ({ userId: id, role: id === userId ? 'OWNER' : 'MEMBER' })) },
      },
      include: { participants: { include: { user: { include: userInclude } } } },
    })

    return {
      id: conv.id, type: conv.type, name: conv.name, description: conv.description, avatarUrl: null,
      maxMembers: conv.maxMembers, toneTagRequired: conv.toneTagRequired, slowModeSeconds: conv.slowModeSeconds,
      isActive: true, lastMessageAt: null, participants: conv.participants.map(mapParticipant),
      lastMessage: null, unreadCount: 0, createdAt: conv.createdAt.toISOString(),
    } satisfies ConversationPublic
  }),

  // --- MESSAGES ---

  sendMessage: protectedProcedure.input(sendMessageSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { conversationId, content, toneTag, replyToId } = input

    const me = await ctx.db.conversationParticipant.findFirst({ where: { conversationId, userId, leftAt: null } })
    if (!me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a participant' })
    if (await isOnSafeExit(ctx.db, userId, conversationId)) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'On safe exit -- return first' })

    const senderBattery = await getBatteryLevel(ctx.db, userId)
    if (senderBattery === 'LURKER') throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Cannot send in LURKER mode' })

    // Slow mode check
    const conv = await ctx.db.conversation.findUnique({ where: { id: conversationId }, select: { slowModeSeconds: true } })
    if (conv?.slowModeSeconds && conv.slowModeSeconds > 0) {
      const last = await ctx.db.message.findFirst({ where: { conversationId, senderId: userId, isSystem: false }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
      if (last) {
        const wait = conv.slowModeSeconds * 1000 - (Date.now() - last.createdAt.getTime())
        if (wait > 0) throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: `Slow mode: wait ${Math.ceil(wait / 1000)}s` })
      }
    }

    if (replyToId) {
      const target = await ctx.db.message.findFirst({ where: { id: replyToId, conversationId } })
      if (!target) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reply target not found' })
    }

    // Battery-based delivery status
    const others = await ctx.db.conversationParticipant.findMany({ where: { conversationId, userId: { not: userId }, leftAt: null }, select: { userId: true } })
    const batteries = await Promise.all(others.map(async (p: any) => getBatteryLevel(ctx.db, p.userId)))
    const status = batteries.every((b) => b === 'LURKER') || batteries.some((b) => b === 'RED') ? 'QUEUED' : 'DELIVERED'

    const msg = await ctx.db.message.create({
      data: { conversationId, senderId: userId, content, toneTag, status, replyToId: replyToId ?? null },
      include: msgInclude,
    })

    await ctx.db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } })
    // TODO: Socket emit new_message

    return mapMessage(msg)
  }),

  editMessage: protectedProcedure.input(editMessageSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const msg = await ctx.db.message.findUnique({ where: { id: input.messageId }, select: { senderId: true, createdAt: true, isSystem: true } })
    if (!msg) throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found' })
    if (msg.senderId !== userId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Can only edit own messages' })
    if (msg.isSystem) throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot edit system messages' })
    if (Date.now() - msg.createdAt.getTime() > 15 * 60 * 1000) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Edit window expired (15 min)' })

    const updated = await ctx.db.message.update({
      where: { id: input.messageId },
      data: { content: input.content, ...(input.toneTag ? { toneTag: input.toneTag } : {}), editedAt: new Date() },
    })
    // TODO: Socket emit message_edited
    return { id: updated.id, content: updated.content, toneTag: updated.toneTag, editedAt: updated.editedAt?.toISOString() ?? null }
  }),

  // --- READ RECEIPTS ---

  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string(), upToMessageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const me = await ctx.db.conversationParticipant.findFirst({ where: { conversationId: input.conversationId, userId, leftAt: null } })
      if (!me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a participant' })

      const target = await ctx.db.message.findUnique({ where: { id: input.upToMessageId }, select: { createdAt: true, conversationId: true } })
      if (!target || target.conversationId !== input.conversationId) throw new TRPCError({ code: 'NOT_FOUND' })

      const unread = await ctx.db.message.findMany({
        where: { conversationId: input.conversationId, createdAt: { lte: target.createdAt }, senderId: { not: userId }, reads: { none: { userId } } },
        select: { id: true },
      })

      if (unread.length > 0) {
        await ctx.db.messageRead.createMany({ data: unread.map((m: any) => ({ messageId: m.id, userId })), skipDuplicates: true })
      }
      await ctx.db.conversationParticipant.update({ where: { id: me.id }, data: { lastReadAt: new Date() } })
      // TODO: Socket emit messages_read
      return { markedCount: unread.length }
    }),

  // --- SAFE EXIT ---

  triggerSafeExit: protectedProcedure.input(safeExitSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const existing = await ctx.db.safeExit.findFirst({ where: { userId, returnedAt: null } })
    if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already on safe exit' })

    const autoMsg = input.reason === 'CUSTOM' && input.customMessage ? input.customMessage : SAFE_EXIT_MSGS[input.reason] ?? SAFE_EXIT_MSGS.CUSTOM!

    const exit = await ctx.db.safeExit.create({
      data: {
        userId, conversationId: input.conversationId ?? null, reason: input.reason,
        customMessage: input.customMessage ?? null, autoMessage: autoMsg,
        plannedReturn: input.plannedReturn ? new Date(input.plannedReturn) : null,
      },
      include: { user: { include: userInclude } },
    })

    // Post system message in affected conversations
    const targetConvs = input.conversationId
      ? [input.conversationId]
      : await ctx.db.conversationParticipant.findMany({ where: { userId, leftAt: null }, select: { conversationId: true } }).then((ps: any[]) => ps.map((p) => p.conversationId))

    await Promise.all(targetConvs.map((cid: string) =>
      ctx.db.message.create({ data: { conversationId: cid, senderId: userId, content: autoMsg, toneTag: 'HELP', isSystem: true, status: 'DELIVERED' } })
    ))
    // TODO: Socket emit safe_exit

    return {
      id: exit.id, userId: exit.userId,
      user: { id: exit.user.id, username: exit.user.username, profile: exit.user.profile, socialBattery: exit.user.socialBattery },
      conversationId: exit.conversationId, reason: exit.reason, customMessage: exit.customMessage,
      autoMessage: exit.autoMessage, exitedAt: exit.exitedAt.toISOString(), returnedAt: null,
      plannedReturn: exit.plannedReturn?.toISOString() ?? null,
    } satisfies SafeExitPublic
  }),

  returnFromBreak: protectedProcedure.input(z.object({ safeExitId: z.string() })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const exit = await ctx.db.safeExit.findUnique({ where: { id: input.safeExitId } })
    if (!exit || exit.userId !== userId) throw new TRPCError({ code: 'NOT_FOUND', message: 'Safe exit not found' })
    if (exit.returnedAt) throw new TRPCError({ code: 'CONFLICT', message: 'Already returned' })

    const updated = await ctx.db.safeExit.update({ where: { id: input.safeExitId }, data: { returnedAt: new Date() } })

    const targetConvs = exit.conversationId
      ? [exit.conversationId]
      : await ctx.db.conversationParticipant.findMany({ where: { userId, leftAt: null }, select: { conversationId: true } }).then((ps: any[]) => ps.map((p) => p.conversationId))

    await Promise.all(targetConvs.map((cid: string) =>
      ctx.db.message.create({ data: { conversationId: cid, senderId: userId, content: 'Returned from break -- hey!', toneTag: 'ENTHUSIASM', isSystem: true, status: 'DELIVERED' } })
    ))
    // TODO: Socket emit return_from_break
    return { id: updated.id, returnedAt: updated.returnedAt?.toISOString() ?? null }
  }),

  getSafeExitStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const active = await ctx.db.safeExit.findFirst({
      where: { userId, returnedAt: null },
      include: { user: { include: userInclude } },
    })
    if (!active) return { isOnBreak: false, currentExit: null, breakDurationMinutes: null, plannedReturn: null } satisfies SafeExitStatus

    return {
      isOnBreak: true,
      currentExit: {
        id: active.id, userId: active.userId,
        user: { id: active.user.id, username: active.user.username, profile: active.user.profile, socialBattery: active.user.socialBattery },
        conversationId: active.conversationId, reason: active.reason, customMessage: active.customMessage,
        autoMessage: active.autoMessage, exitedAt: active.exitedAt.toISOString(), returnedAt: null,
        plannedReturn: active.plannedReturn?.toISOString() ?? null,
      },
      breakDurationMinutes: Math.floor((Date.now() - active.exitedAt.getTime()) / 60000),
      plannedReturn: active.plannedReturn?.toISOString() ?? null,
    } satisfies SafeExitStatus
  }),

  // --- NOTIFICATION PREFERENCES ---

  getNotificationPrefs: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    let prefs = await ctx.db.notificationPreference.findUnique({ where: { userId } })
    if (!prefs) prefs = await ctx.db.notificationPreference.create({ data: { userId } })
    return {
      greenBattery: prefs.greenBattery, yellowBattery: prefs.yellowBattery,
      redBattery: prefs.redBattery, lurkerBattery: prefs.lurkerBattery,
      quietHoursEnabled: prefs.quietHoursEnabled, quietHoursStart: prefs.quietHoursStart, quietHoursEnd: prefs.quietHoursEnd,
      digestEnabled: prefs.digestEnabled, digestIntervalMin: prefs.digestIntervalMin,
      newMessageEnabled: prefs.newMessageEnabled, mentionEnabled: prefs.mentionEnabled,
      reactionEnabled: prefs.reactionEnabled, safeExitEnabled: prefs.safeExitEnabled,
    } satisfies NotificationPreferencePublic
  }),

  updateNotificationPrefs: protectedProcedure.input(updateNotifPrefsSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const prefs = await ctx.db.notificationPreference.upsert({ where: { userId }, create: { userId, ...input }, update: input })
    return {
      greenBattery: prefs.greenBattery, yellowBattery: prefs.yellowBattery,
      redBattery: prefs.redBattery, lurkerBattery: prefs.lurkerBattery,
      quietHoursEnabled: prefs.quietHoursEnabled, quietHoursStart: prefs.quietHoursStart, quietHoursEnd: prefs.quietHoursEnd,
      digestEnabled: prefs.digestEnabled, digestIntervalMin: prefs.digestIntervalMin,
      newMessageEnabled: prefs.newMessageEnabled, mentionEnabled: prefs.mentionEnabled,
      reactionEnabled: prefs.reactionEnabled, safeExitEnabled: prefs.safeExitEnabled,
    } satisfies NotificationPreferencePublic
  }),

  // --- MESSAGE QUEUE ---

  getMessageQueue: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const queued = await ctx.db.message.findMany({
      where: { status: 'QUEUED', conversation: { participants: { some: { userId, leftAt: null } } }, senderId: { not: userId } },
      include: { sender: { include: { profile: { select: { displayName: true } } } } },
      orderBy: { createdAt: 'asc' }, take: 100,
    })
    const battery = await getBatteryLevel(ctx.db, userId)
    return {
      pendingCount: queued.length,
      messages: queued.map((m: any) => ({
        messageId: m.id, conversationId: m.conversationId, senderUsername: m.sender.username,
        toneTag: m.toneTag, preview: m.content.substring(0, 50), queuedAt: m.createdAt.toISOString(),
        recipientBattery: battery, estimatedDelivery: null,
      })),
      nextDeliveryCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    } satisfies MessageQueueStatus
  }),

  deliverQueuedMessages: protectedProcedure
    .input(z.object({ messageIds: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const result = await ctx.db.message.updateMany({
        where: {
          status: 'QUEUED', conversation: { participants: { some: { userId, leftAt: null } } },
          senderId: { not: userId }, ...(input.messageIds?.length ? { id: { in: input.messageIds } } : {}),
        },
        data: { status: 'DELIVERED' },
      })
      return { deliveredCount: result.count }
    }),

  // --- PARTICIPANT MANAGEMENT ---

  addParticipant: protectedProcedure
    .input(z.object({ conversationId: z.string(), userId: z.string(), role: participantRoleSchema.default('MEMBER') }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id
      const requester = await ctx.db.conversationParticipant.findFirst({
        where: { conversationId: input.conversationId, userId: currentUserId, leftAt: null, role: { in: ['OWNER', 'ADMIN'] } },
      })
      if (!requester) throw new TRPCError({ code: 'FORBIDDEN', message: 'Only owners/admins can add participants' })

      const conv = await ctx.db.conversation.findUnique({ where: { id: input.conversationId }, include: { participants: { where: { leftAt: null } } } })
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND' })
      if (conv.type === 'DIRECT') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot add to direct conversations' })
      if (conv.participants.length >= conv.maxMembers) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: `Full (max ${conv.maxMembers})` })

      const existing = await ctx.db.conversationParticipant.findFirst({ where: { conversationId: input.conversationId, userId: input.userId, leftAt: null } })
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Already a participant' })

      const p = await ctx.db.conversationParticipant.create({
        data: { conversationId: input.conversationId, userId: input.userId, role: input.role },
        include: { user: { include: userInclude } },
      })

      await ctx.db.message.create({
        data: {
          conversationId: input.conversationId, senderId: currentUserId,
          content: `${p.user.profile?.displayName ?? p.user.username ?? 'Someone'} joined the conversation`,
          toneTag: 'ENTHUSIASM', isSystem: true, status: 'DELIVERED',
        },
      })

      return { id: p.id, user: { id: p.user.id, username: p.user.username, profile: p.user.profile, socialBattery: p.user.socialBattery }, role: p.role, joinedAt: p.joinedAt.toISOString() }
    }),

  leaveConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const me = await ctx.db.conversationParticipant.findFirst({ where: { conversationId: input.conversationId, userId, leftAt: null } })
      if (!me) throw new TRPCError({ code: 'NOT_FOUND', message: 'Not a participant' })

      await ctx.db.conversationParticipant.update({ where: { id: me.id }, data: { leftAt: new Date() } })

      const user = await ctx.db.user.findUnique({ where: { id: userId }, include: { profile: { select: { displayName: true } } } })
      await ctx.db.message.create({
        data: {
          conversationId: input.conversationId, senderId: userId,
          content: `${user?.profile?.displayName ?? user?.username ?? 'Someone'} left the conversation`,
          toneTag: 'HELP', isSystem: true, status: 'DELIVERED',
        },
      })

      const remaining = await ctx.db.conversationParticipant.count({ where: { conversationId: input.conversationId, leftAt: null } })
      if (remaining === 0) await ctx.db.conversation.update({ where: { id: input.conversationId }, data: { isActive: false } })

      return { left: true }
    }),
})