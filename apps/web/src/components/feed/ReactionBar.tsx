'use client'

import { useState } from 'react'
import { REACTIONS } from '@hyperhub/shared'
import type { ReactionTypeValue, ReactionPublic } from '@hyperhub/shared'

interface ReactionBarProps {
  postId: string
  reactions: ReactionPublic[]
  userReactions: ReactionTypeValue[]
  onToggleReaction: (postId: string, type: string) => Promise<void>
  compact?: boolean
}

export function ReactionBar({
  postId,
  reactions,
  userReactions,
  onToggleReaction,
  compact = false,
}: ReactionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [animating, setAnimating] = useState<string | null>(null)

  const handleReaction = async (type: ReactionTypeValue) => {
    setAnimating(type)
    await onToggleReaction(postId, type)
    setTimeout(() => setAnimating(null), 300)
  }

  // Build reaction counts map
  const reactionCounts = new Map<string, number>()
  reactions.forEach((r) => reactionCounts.set(r.type, r.count))

  const allTypes = Object.keys(REACTIONS) as ReactionTypeValue[]
  const activeTypes = allTypes.filter(
    (type) => reactionCounts.has(type) || userReactions.includes(type)
  )
  const displayTypes = isExpanded ? allTypes : (activeTypes.length > 0 ? activeTypes : allTypes.slice(0, 3))

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displayTypes.map((type) => {
        const reaction = REACTIONS[type]
        const count = reactionCounts.get(type) || 0
        const isActive = userReactions.includes(type)
        const isAnimatingThis = animating === type

        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            className={`
              inline-flex items-center gap-1 rounded-full
              transition-all duration-200
              ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
              ${isActive
                ? 'bg-opacity-20 ring-1 ring-opacity-50'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
              ${isAnimatingThis ? 'scale-125' : 'hover:scale-105 active:scale-95'}
            `}
            style={isActive ? {
              backgroundColor: `${reaction.color}20`,
              borderColor: `${reaction.color}50`,
              color: reaction.color,
            } : undefined}
            title={reaction.description}
          >
            <span className={isAnimatingThis ? 'animate-bounce' : ''}>
              {reaction.emoji}
            </span>
            {count > 0 && (
              <span className="font-medium tabular-nums">{count}</span>
            )}
          </button>
        )
      })}

      {!isExpanded && activeTypes.length < allTypes.length && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`
            inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800
            hover:bg-gray-200 dark:hover:bg-gray-700
            transition-colors duration-200
            ${compact ? 'px-2 py-0.5 text-xs' : 'px-2 py-1 text-sm'}
            text-gray-500
          `}
        >
          +
        </button>
      )}
    </div>
  )
}