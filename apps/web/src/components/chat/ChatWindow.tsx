// ============================================================
// Phase 4: ChatWindow Component
// apps/web/src/components/chat/ChatWindow.tsx
// ============================================================

'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useConversation, useSendMessage, useReadReceipts, useSafeExit, useTypingIndicator, useAutoScroll, useParticipants, useSocketMessages } from '~/hooks/useChat'
import { TONE_TAGS_CHAT, BATTERY_LEVELS, SAFE_EXIT_REASONS } from '@hyperhub/shared'
import type { MessagePublic, ConversationPublic, BatteryLevelType, ToneTagType, SafeExitReasonType } from '@hyperhub/shared'
import MessageComposer from './MessageComposer'

// ============================================================
// MessageBubble
// ============================================================

function MessageBubble({
  message,
  isMine,
  onReply,
}: {
  message: MessagePublic
  isMine: boolean
  onReply: (msg: MessagePublic) => void
}) {
  const toneTag = TONE_TAGS_CHAT.find((t) => t.value === message.toneTag)

  // System messages
  if (message.isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-[11px] text-white/30 bg-white/5 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group mb-1`}>
      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Reply preview */}
        {message.replyTo && (
          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-0.5`}>
            <div className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md border-l-2 border-indigo-500/30 max-w-[200px] truncate">
              {message.replyTo.sender.displayName ?? message.replyTo.sender.username}: {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Sender name (for others) */}
        {!isMine && (
          <span className="text-[10px] text-white/40 ml-1 mb-0.5 block">
            {message.sender.profile?.displayName ?? message.sender.username}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`relative px-3 py-2 rounded-2xl ${
            isMine
              ? 'bg-indigo-600/80 text-white rounded-br-md'
              : 'bg-white/8 text-white/90 rounded-bl-md'
          }`}
        >
          {/* Tone tag badge */}
          {toneTag && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full mb-1 ${
                isMine ? 'bg-white/15 text-white/80' : 'bg-white/8 text-white/60'
              }`}
              title={toneTag.description}
            >
              {toneTag.emoji} {toneTag.label}
            </span>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

          {/* Footer: time + status */}
          <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-white/25">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.editedAt && (
              <span className="text-[10px] text-white/20">(edited)</span>
            )}
            {isMine && (
              <MessageStatus status={message.status} reads={message.reads} />
            )}
          </div>
        </div>

        {/* Reply button (hover) */}
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 text-[10px] text-white/30 hover:text-white/50 mt-0.5 ml-1 transition-opacity"
        >
          Reply
        </button>
      </div>
    </div>
  )
}

// ============================================================
// MessageStatus indicator
// ============================================================

function MessageStatus({ status, reads }: { status: string; reads: { userId: string; username: string | null; readAt: string }[] }) {
  if (reads.length > 0) {
    return (
      <span className="text-[10px] text-blue-400" title={`Read by ${reads.map((r) => r.username).join(', ')}`}>
        Read
      </span>
    )
  }
  if (status === 'DELIVERED') return <span className="text-[10px] text-white/25">Sent</span>
  if (status === 'QUEUED') return <span className="text-[10px] text-amber-400/60">Queued</span>
  if (status === 'FAILED') return <span className="text-[10px] text-red-400/60">Failed</span>
  return null
}

// ============================================================
// TypingIndicator
// ============================================================

function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null

  const text = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
      ? `${users[0]} and ${users[1]} are typing`
      : `${users[0]} and ${users.length - 1} others are typing`

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-[11px] text-white/30">{text}</span>
    </div>
  )
}

// ============================================================
// SafeExitButton
// ============================================================

function SafeExitButton({ onTrigger }: { onTrigger: (reason: SafeExitReasonType) => void }) {
  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs text-amber-300 transition-all"
        title="Take a break -- no judgment"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Need a break
      </button>

      {/* Dropdown */}
      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-20">
        <div className="bg-neutral-800 border border-white/10 rounded-xl p-1.5 shadow-xl min-w-[200px]">
          {SAFE_EXIT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => onTrigger(r.value as SafeExitReasonType)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-white/70 hover:bg-white/5 hover:text-white/90 transition-colors"
            >
              <span>{r.emoji}</span>
              <div>
                <p className="font-medium">{r.label}</p>
                <p className="text-[10px] text-white/40">{r.autoMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ConversationHeader
// ============================================================

function ConversationHeader({
  conversation,
  onBack,
  onSafeExit,
}: {
  conversation: any
  onBack: () => void
  onSafeExit: (reason: SafeExitReasonType) => void
}) {
  const displayName = conversation.type === 'DIRECT'
    ? conversation.participants[1]?.user.profile?.displayName ?? conversation.participants[1]?.user.username ?? 'Chat'
    : conversation.name ?? 'Group'

  const otherBattery = conversation.type === 'DIRECT'
    ? conversation.participants[1]?.user.socialBattery?.level
    : null

  const memberCount = conversation.participants.length

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-neutral-900/30">
      <div className="flex items-center gap-3">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 text-white/50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white/90">{displayName}</h3>
            {otherBattery && (
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: BATTERY_LEVELS[otherBattery as BatteryLevelType]?.color ?? '#888' }}
              />
            )}
            {conversation.type !== 'DIRECT' && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                conversation.type === 'SAFE_SPACE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-violet-500/15 text-violet-400'
              }`}>
                {conversation.type === 'SAFE_SPACE' ? 'Safe Space' : 'Group'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/35">
            {conversation.type === 'DIRECT' ? 'Direct message' : `${memberCount} members`}
            {conversation.toneTagRequired && ' -- tone tags required'}
          </p>
        </div>
      </div>

      <SafeExitButton onTrigger={onSafeExit} />
    </div>
  )
}

// ============================================================
// Main ChatWindow
// ============================================================

interface ChatWindowProps {
  conversationId: string | null
  currentUserId: string
  onBack: () => void
}

export default function ChatWindow({ conversationId, currentUserId, onBack }: ChatWindowProps) {
  const { conversation, messages, isLoading, hasMoreMessages, fetchOlderMessages, isFetchingMore } = useConversation(conversationId)
  const { send, isSending, sendError } = useSendMessage(conversationId)
  const { markRead } = useReadReceipts(conversationId)
  const { triggerExit } = useSafeExit()
  const { typingUsers, isAnyoneTyping, emitTyping, handleTypingEvent } = useTypingIndicator(conversationId)
  const { scrollRef, isAtBottom, newMessageCount, handleScroll, scrollToBottom } = useAutoScroll(messages)

  // Socket connection
  useSocketMessages(conversationId, { onTyping: handleTypingEvent })

  // Reply state
  const [replyTo, setReplyTo] = useState<MessagePublic | null>(null)

  // Auto-mark last message as read when visible
  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && lastMsg.sender.id !== currentUserId) {
        markRead(lastMsg.id)
      }
    }
  }, [messages.length, isAtBottom]) // eslint-disable-line react-hooks/exhaustive-deps

  // Empty state
  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950/30">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-indigo-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-white/30">Select a conversation</p>
          <p className="text-xs text-white/20 mt-1">or start a new one</p>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-neutral-950/20">
      {/* Header */}
      {conversation && (
        <ConversationHeader
          conversation={conversation}
          onBack={onBack}
          onSafeExit={(reason) => triggerExit(reason, { conversationId: conversationId! })}
        />
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin"
      >
        {/* Load older */}
        {hasMoreMessages && (
          <div className="text-center py-2">
            <button
              onClick={() => fetchOlderMessages()}
              disabled={isFetchingMore}
              className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-white/20"
            >
              {isFetchingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.sender.id === currentUserId}
            onReply={setReplyTo}
          />
        ))}

        {/* Typing indicator */}
        <TypingIndicator users={typingUsers} />
      </div>

      {/* New messages indicator */}
      {!isAtBottom && newMessageCount > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs shadow-lg hover:bg-indigo-500 transition-colors"
        >
          {newMessageCount} new message{newMessageCount > 1 ? 's' : ''}
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Composer */}
      <MessageComposer
        conversationId={conversationId}
        toneTagRequired={conversation?.toneTagRequired ?? true}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={async (content, toneTag, replyToId) => {
          await send(content, toneTag, replyToId)
          setReplyTo(null)
        }}
        onTyping={emitTyping}
        isSending={isSending}
        error={sendError?.message ?? null}
      />
    </div>
  )
}