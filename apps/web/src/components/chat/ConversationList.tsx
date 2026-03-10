// ============================================================
// Phase 4: ConversationList Component
// apps/web/src/components/chat/ConversationList.tsx
// ============================================================

'use client'

import { useState, useMemo } from 'react'
import { useConversations, useSafeExit, useMessageQueue } from '~/hooks/useChat'
import { TONE_TAGS_CHAT, BATTERY_LEVELS } from '@hyperhub/shared'
import type { ConversationPublic, ConversationTypeValue, BatteryLevelType } from '@hyperhub/shared'

// ============================================================
// Sub-components
// ============================================================

function BatteryIndicator({ level }: { level: BatteryLevelType }) {
  const config = BATTERY_LEVELS[level] ?? BATTERY_LEVELS.GREEN
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full border border-white/20"
      style={{ backgroundColor: config.color }}
      title={`Battery: ${config.label}`}
      aria-label={`Social battery: ${config.label}`}
    />
  )
}

function ConversationAvatar({ conversation }: { conversation: ConversationPublic }) {
  const { type, name, avatarUrl, participants } = conversation

  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name ?? 'Chat'} className="h-12 w-12 rounded-xl object-cover" />
    )
  }

  // For DIRECT: show other user's avatar
  if (type === 'DIRECT' && participants.length >= 2) {
    const other = participants[1] // First participant is usually "me"
    const avatar = other?.user.profile?.avatarUrl
    if (avatar) {
      return <img src={avatar} alt={other.user.username ?? ''} className="h-12 w-12 rounded-xl object-cover" />
    }
    // Fallback: initials
    const initials = (other?.user.profile?.displayName ?? other?.user.username ?? '?').charAt(0).toUpperCase()
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 font-semibold text-lg">
        {initials}
      </div>
    )
  }

  // Group: show type icon
  const icon = type === 'SAFE_SPACE' ? 'SS' : 'G'
  const bgColor = type === 'SAFE_SPACE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-violet-500/20 text-violet-300'
  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} font-semibold text-sm`}>
      {icon}
    </div>
  )
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: ConversationPublic
  isActive: boolean
  onClick: () => void
}) {
  const { type, name, participants, lastMessage, unreadCount, lastMessageAt } = conversation

  // Display name: for DIRECT, show other user's name
  const displayName = type === 'DIRECT'
    ? participants[1]?.user.profile?.displayName ?? participants[1]?.user.username ?? 'Chat'
    : name ?? 'Group Chat'

  // Other user's battery (for DIRECT)
  const otherBattery = type === 'DIRECT' ? participants[1]?.user.socialBattery?.level : null

  // Format timestamp
  const timeDisplay = lastMessageAt
    ? formatRelativeTime(new Date(lastMessageAt))
    : ''

  // Last message preview
  const preview = lastMessage
    ? lastMessage.isSystem
      ? lastMessage.content
      : `${lastMessage.sender.username ?? 'Someone'}: ${lastMessage.content}`
    : 'No messages yet'

  // Tone tag of last message
  const lastToneTag = lastMessage?.toneTag
    ? TONE_TAGS_CHAT.find((t) => t.value === lastMessage.toneTag)
    : null

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group
        ${isActive
          ? 'bg-white/10 border border-white/10'
          : 'hover:bg-white/5 border border-transparent'
        }
        ${unreadCount > 0 ? 'font-medium' : ''}
      `}
      aria-label={`Open conversation with ${displayName}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <ConversationAvatar conversation={conversation} />
        {otherBattery && (
          <span className="absolute -bottom-0.5 -right-0.5">
            <BatteryIndicator level={otherBattery as BatteryLevelType} />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-white/90">{displayName}</span>
          <span className="text-[11px] text-white/40 flex-shrink-0">{timeDisplay}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {lastToneTag && (
            <span className="text-[11px] flex-shrink-0" title={lastToneTag.label}>
              {lastToneTag.emoji}
            </span>
          )}
          <p className="truncate text-xs text-white/50">{preview}</p>
        </div>

        {/* Type badge for groups */}
        {type !== 'DIRECT' && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              type === 'SAFE_SPACE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-violet-500/15 text-violet-400'
            }`}>
              {type === 'SAFE_SPACE' ? 'Safe Space' : 'Group'}
            </span>
            <span className="text-[10px] text-white/30">
              {participants.length} members
            </span>
          </div>
        )}
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="flex-shrink-0 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500 text-white text-[11px] font-semibold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

// ============================================================
// Utility: relative time
// ============================================================

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDay < 7) return `${diffDay}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ============================================================
// Main Component
// ============================================================

interface ConversationListProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
}

export default function ConversationList({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [filter, setFilter] = useState<ConversationTypeValue | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const { conversations, totalUnread, isLoading, hasMore, fetchMore, isFetchingMore } =
    useConversations(filter !== 'ALL' ? { type: filter as ConversationTypeValue } : undefined)

  const { status: safeExitStatus } = useSafeExit()
  const { queue } = useMessageQueue()

  // Filter by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((c) => {
      const name = c.type === 'DIRECT'
        ? c.participants[1]?.user.profile?.displayName ?? c.participants[1]?.user.username ?? ''
        : c.name ?? ''
      return name.toLowerCase().includes(q)
    })
  }, [conversations, searchQuery])

  // Pinned conversations first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPinned = a.participants.some((p) => p.pinned)
      const bPinned = b.participants.some((p) => p.pinned)
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1
      return 0
    })
  }, [filtered])

  return (
    <div className="flex h-full flex-col bg-neutral-900/50 border-r border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white/90">Messages</h2>
          {totalUnread > 0 && (
            <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500/80 text-white text-[11px] font-semibold">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>
        <button
          onClick={onNewConversation}
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
          aria-label="New conversation"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Safe Exit Banner */}
      {safeExitStatus.isOnBreak && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          On break ({safeExitStatus.breakDurationMinutes}min)
          {safeExitStatus.plannedReturn && (
            <span className="text-amber-400/60"> -- back {new Date(safeExitStatus.plannedReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      )}

      {/* Queued Messages Banner */}
      {queue.pendingCount > 0 && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          {queue.pendingCount} queued message{queue.pendingCount > 1 ? 's' : ''} (battery-delayed)
        </div>
      )}

      {/* Search */}
      <div className="px-3 pt-2">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-indigo-500/30"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 px-3 pt-2 pb-1">
        {(['ALL', 'DIRECT', 'GROUP', 'SAFE_SPACE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
              filter === tab
                ? 'bg-white/10 text-white/90'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab === 'SAFE_SPACE' ? 'Safe' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-white/30">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewConversation}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Start a conversation
              </button>
            )}
          </div>
        )}

        {sorted.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onClick={() => onSelectConversation(conv.id)}
          />
        ))}

        {/* Load More */}
        {hasMore && (
          <div className="py-2 text-center">
            <button
              onClick={() => fetchMore()}
              disabled={isFetchingMore}
              className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-white/20"
            >
              {isFetchingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}