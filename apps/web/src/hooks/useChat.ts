// ============================================================
// Phase 4: Chat Hooks (React + tRPC)
// apps/web/src/hooks/useChat.ts
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '~/utils/api'
import type {
  ConversationPublic,
  ConversationDetail,
  MessagePublic,
  SafeExitStatus,
  NotificationPreferencePublic,
  MessageQueueStatus,
  ToneTagType,
  SafeExitReasonType,
  ConversationTypeValue,
  SocketEvent,
  SocketMessageEvent,
  SocketTypingEvent,
  SocketReadEvent,
  SocketSafeExitEvent,
} from '@hyperhub/shared'
import { CHAT_CONFIG } from '@hyperhub/shared'

// ============================================================
// useConversations -- list & manage conversations
// ============================================================

export function useConversations(options?: { type?: ConversationTypeValue }) {
  const utils = api.useUtils()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    api.messages.getConversations.useInfiniteQuery(
      { limit: 20, type: options?.type },
      {
        getNextPageParam: (last) => last.nextCursor,
        refetchInterval: 30_000, // Refresh every 30s
      }
    )

  const conversations: ConversationPublic[] =
    data?.pages.flatMap((p) => p.conversations) ?? []

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  const createConversation = api.messages.create.useMutation({
    onSuccess: () => utils.messages.getConversations.invalidate(),
  })

  return {
    conversations,
    totalUnread,
    isLoading,
    error,
    hasMore: hasNextPage ?? false,
    isFetchingMore: isFetchingNextPage,
    fetchMore: fetchNextPage,
    createConversation: createConversation.mutateAsync,
    isCreating: createConversation.isPending,
    refresh: () => utils.messages.getConversations.invalidate(),
  }
}

// ============================================================
// useConversation -- single conversation detail + messages
// ============================================================

export function useConversation(conversationId: string | null) {
  const utils = api.useUtils()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    api.messages.getConversation.useInfiniteQuery(
      { conversationId: conversationId!, messageLimit: 50 },
      {
        enabled: !!conversationId,
        getNextPageParam: (last) => (last.hasMoreMessages ? last.nextCursor : undefined),
      }
    )

  // Flatten messages from all pages (oldest first)
  const allMessages: MessagePublic[] = []
  const pages = data?.pages ?? []
  // Pages are in reverse order (newest page first), so reverse to get chronological
  for (const page of [...pages].reverse()) {
    allMessages.push(...page.messages)
  }

  const conversation = pages[0] ?? null

  return {
    conversation,
    messages: allMessages,
    isLoading,
    error,
    hasMoreMessages: hasNextPage ?? false,
    isFetchingMore: isFetchingNextPage,
    fetchOlderMessages: fetchNextPage,
    refresh: () => utils.messages.getConversation.invalidate(),
  }
}

// ============================================================
// useSendMessage -- send with battery-aware delivery
// ============================================================

export function useSendMessage(conversationId: string | null) {
  const utils = api.useUtils()

  const sendMutation = api.messages.sendMessage.useMutation({
    onSuccess: () => {
      if (conversationId) {
        utils.messages.getConversation.invalidate({ conversationId })
      }
      utils.messages.getConversations.invalidate()
    },
  })

  const editMutation = api.messages.editMessage.useMutation({
    onSuccess: () => {
      if (conversationId) {
        utils.messages.getConversation.invalidate({ conversationId })
      }
    },
  })

  const send = useCallback(
    async (content: string, toneTag: ToneTagType, replyToId?: string) => {
      if (!conversationId) return null
      return sendMutation.mutateAsync({ conversationId, content, toneTag, replyToId })
    },
    [conversationId, sendMutation]
  )

  const edit = useCallback(
    async (messageId: string, content: string, toneTag?: ToneTagType) => {
      return editMutation.mutateAsync({ messageId, content, toneTag })
    },
    [editMutation]
  )

  return {
    send,
    edit,
    isSending: sendMutation.isPending,
    isEditing: editMutation.isPending,
    sendError: sendMutation.error,
    editError: editMutation.error,
  }
}

// ============================================================
// useReadReceipts -- mark messages as read
// ============================================================

export function useReadReceipts(conversationId: string | null) {
  const utils = api.useUtils()
  const lastMarkedRef = useRef<string | null>(null)

  const markReadMutation = api.messages.markRead.useMutation({
    onSuccess: () => {
      utils.messages.getConversations.invalidate()
    },
  })

  const markRead = useCallback(
    (upToMessageId: string) => {
      if (!conversationId) return
      // Avoid duplicate calls for same message
      if (lastMarkedRef.current === upToMessageId) return
      lastMarkedRef.current = upToMessageId
      markReadMutation.mutate({ conversationId, upToMessageId })
    },
    [conversationId, markReadMutation]
  )

  return { markRead }
}

// ============================================================
// useSafeExit -- manage safe exit / break
// ============================================================

export function useSafeExit() {
  const utils = api.useUtils()

  const { data: status, isLoading } = api.messages.getSafeExitStatus.useQuery(undefined, {
    refetchInterval: 60_000, // Check every minute
  })

  const triggerMutation = api.messages.triggerSafeExit.useMutation({
    onSuccess: () => {
      utils.messages.getSafeExitStatus.invalidate()
      utils.messages.getConversations.invalidate()
    },
  })

  const returnMutation = api.messages.returnFromBreak.useMutation({
    onSuccess: () => {
      utils.messages.getSafeExitStatus.invalidate()
      utils.messages.getConversations.invalidate()
    },
  })

  const triggerExit = useCallback(
    async (reason: SafeExitReasonType, options?: { customMessage?: string; conversationId?: string; plannedReturn?: string }) => {
      return triggerMutation.mutateAsync({
        reason,
        customMessage: options?.customMessage,
        conversationId: options?.conversationId,
        plannedReturn: options?.plannedReturn,
      })
    },
    [triggerMutation]
  )

  const returnFromBreak = useCallback(
    async (safeExitId: string) => {
      return returnMutation.mutateAsync({ safeExitId })
    },
    [returnMutation]
  )

  return {
    status: status ?? { isOnBreak: false, currentExit: null, breakDurationMinutes: null, plannedReturn: null },
    isLoading,
    triggerExit,
    returnFromBreak,
    isTriggering: triggerMutation.isPending,
    isReturning: returnMutation.isPending,
  }
}

// ============================================================
// useNotificationPrefs -- battery-aware notification settings
// ============================================================

export function useNotificationPrefs() {
  const utils = api.useUtils()

  const { data: prefs, isLoading } = api.messages.getNotificationPrefs.useQuery()

  const updateMutation = api.messages.updateNotificationPrefs.useMutation({
    onSuccess: () => utils.messages.getNotificationPrefs.invalidate(),
  })

  return {
    prefs: prefs ?? null,
    isLoading,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}

// ============================================================
// useMessageQueue -- battery-queued messages
// ============================================================

export function useMessageQueue() {
  const utils = api.useUtils()

  const { data: queue, isLoading } = api.messages.getMessageQueue.useQuery(undefined, {
    refetchInterval: 60_000,
  })

  const deliverMutation = api.messages.deliverQueuedMessages.useMutation({
    onSuccess: () => {
      utils.messages.getMessageQueue.invalidate()
      utils.messages.getConversations.invalidate()
    },
  })

  return {
    queue: queue ?? { pendingCount: 0, messages: [], nextDeliveryCheck: '' },
    isLoading,
    deliverAll: () => deliverMutation.mutateAsync({}),
    deliverSpecific: (ids: string[]) => deliverMutation.mutateAsync({ messageIds: ids }),
    isDelivering: deliverMutation.isPending,
  }
}

// ============================================================
// useTypingIndicator -- respectful typing (battery-aware)
// ============================================================

export function useTypingIndicator(conversationId: string | null) {
  const [typingUsers, setTypingUsers] = useState<Map<string, { username: string | null; timeout: NodeJS.Timeout }>>(new Map())
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle incoming typing events (from socket)
  const handleTypingEvent = useCallback((event: SocketTypingEvent) => {
    if (event.conversationId !== conversationId) return

    setTypingUsers((prev) => {
      const next = new Map(prev)
      if (event.type === 'typing_start') {
        // Clear existing timeout
        const existing = next.get(event.userId)
        if (existing?.timeout) clearTimeout(existing.timeout)

        // Auto-clear after 5 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((p) => { const n = new Map(p); n.delete(event.userId); return n })
        }, 5000)

        next.set(event.userId, { username: event.username, timeout })
      } else {
        const existing = next.get(event.userId)
        if (existing?.timeout) clearTimeout(existing.timeout)
        next.delete(event.userId)
      }
      return next
    })
  }, [conversationId])

  // Emit typing (debounced) -- placeholder for socket integration
  const emitTyping = useCallback(() => {
    if (!conversationId) return
    // TODO: Emit via socket
    // socket.emit('typing_start', { conversationId })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      // socket.emit('typing_stop', { conversationId })
    }, 3000)
  }, [conversationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      typingUsers.forEach((val) => clearTimeout(val.timeout))
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const typingList = Array.from(typingUsers.values()).map((v) => v.username).filter(Boolean)

  return {
    typingUsers: typingList as string[],
    isAnyoneTyping: typingList.length > 0,
    emitTyping,
    handleTypingEvent,
  }
}

// ============================================================
// useParticipants -- manage conversation members
// ============================================================

export function useParticipants(conversationId: string | null) {
  const utils = api.useUtils()

  const addMutation = api.messages.addParticipant.useMutation({
    onSuccess: () => {
      if (conversationId) utils.messages.getConversation.invalidate({ conversationId })
    },
  })

  const leaveMutation = api.messages.leaveConversation.useMutation({
    onSuccess: () => {
      utils.messages.getConversations.invalidate()
    },
  })

  return {
    addParticipant: (userId: string) =>
      conversationId ? addMutation.mutateAsync({ conversationId, userId }) : Promise.reject('No conversation'),
    leave: () =>
      conversationId ? leaveMutation.mutateAsync({ conversationId }) : Promise.reject('No conversation'),
    isAdding: addMutation.isPending,
    isLeaving: leaveMutation.isPending,
  }
}

// ============================================================
// useSocketMessages -- real-time socket integration
// ============================================================

export function useSocketMessages(
  conversationId: string | null,
  callbacks?: {
    onNewMessage?: (msg: MessagePublic) => void
    onTyping?: (event: SocketTypingEvent) => void
    onRead?: (event: SocketReadEvent) => void
    onSafeExit?: (event: SocketSafeExitEvent) => void
  }
) {
  const utils = api.useUtils()
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<any>(null) // Will be Socket.io client

  useEffect(() => {
    if (!conversationId) return

    // TODO: Initialize Socket.io connection
    // const socket = io(CHAT_CONFIG.SOCKET_URL, { auth: { token: sessionToken } })
    // socketRef.current = socket

    // socket.on('connect', () => setIsConnected(true))
    // socket.on('disconnect', () => setIsConnected(false))

    // Join conversation room
    // socket.emit('join', { conversationId })

    // Listen for events
    // socket.on('new_message', (event: SocketMessageEvent) => {
    //   utils.messages.getConversation.invalidate({ conversationId })
    //   utils.messages.getConversations.invalidate()
    //   callbacks?.onNewMessage?.(event.message)
    // })

    // socket.on('typing_start', callbacks?.onTyping)
    // socket.on('typing_stop', callbacks?.onTyping)
    // socket.on('messages_read', callbacks?.onRead)
    // socket.on('safe_exit', callbacks?.onSafeExit)
    // socket.on('return_from_break', callbacks?.onSafeExit)

    return () => {
      // socket.emit('leave', { conversationId })
      // socket.disconnect()
      setIsConnected(false)
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isConnected,
    socket: socketRef.current,
  }
}

// ============================================================
// useAutoScroll -- scroll to bottom on new messages
// ============================================================

export function useAutoScroll(messages: MessagePublic[]) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [newMessageCount, setNewMessageCount] = useState(0)

  // Scroll to bottom when new messages arrive (if already at bottom)
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    } else {
      setNewMessageCount((c) => c + 1)
    }
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const atBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsAtBottom(atBottom)
    if (atBottom) setNewMessageCount(0)
  }, [])

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    setNewMessageCount(0)
  }, [])

  return {
    scrollRef,
    isAtBottom,
    newMessageCount,
    handleScroll,
    scrollToBottom,
  }
}