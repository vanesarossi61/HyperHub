'use client'

import { useState } from 'react'
import { REACTION_TYPES } from '@hyperhub/shared'
import type { ReactionTypeValue, ReactionCount } from '@hyperhub/shared'

// ============================================================
// ReactionBar -- Neurodivergent-friendly reaction system
// ============================================================

interface ReactionBarProps {
  reactions: ReactionCount[]
  userReactions: ReactionTypeValue[]
  onToggleReaction: (type: ReactionTypeValue) => void
  compact?: boolean
  reducedMotion?: boolean
}

export function ReactionBar({
  reactions,
  userReactions,
  onToggleReaction,
  compact = false,
  reducedMotion = true,
}: ReactionBarProps) {
  const [showAll, setShowAll] = useState(false)

  const allTypes = Object.values(REACTION_TYPES)
  const activeReactions = reactions.filter((r) => r.count > 0)

  return (
    <div className="space-y-2">
      {/* Active reactions (always visible) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {activeReactions.map((reaction) => {
          const config = REACTION_TYPES[reaction.type as ReactionTypeValue]
          if (!config) return null

          const isActive = userReactions.includes(reaction.type as ReactionTypeValue)

          return (
            <button
              key={reaction.type}
              onClick={() => onToggleReaction(reaction.type as ReactionTypeValue)}
              className={`
                group relative inline-flex items-center gap-1 rounded-full
                text-sm transition-all
                ${reducedMotion ? 'duration-0' : 'duration-150'}
                ${compact ? 'px-2 py-0.5' : 'px-2.5 py-1'}
                ${isActive
                  ? 'bg-opacity-20 ring-1 ring-opacity-40 font-medium'
                  : 'bg-gray-100 hover:bg-gray-200'
                }
              `}
              style={{
                backgroundColor: isActive ? `${config.color}20` : undefined,
                color: isActive ? config.color : undefined,
                ringColor: isActive ? config.color : undefined,
              }}
              title={config.description}
            >
              <span
                className={`leading-none ${!reducedMotion && isActive ? 'animate-bounce-once' : ''}`}
                aria-hidden="true"
              >
                {config.emoji}
              </span>
              <span className="tabular-nums">{reaction.count}</span>

              {/* Tooltip */}
              <span
                className="
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                  px-2 py-1 rounded text-xs text-white bg-gray-800
                  opacity-0 group-hover:opacity-100 transition-opacity
                  pointer-events-none whitespace-nowrap z-10
                "
              >
                {config.label}
              </span>
            </button>
          )
        })}

        {/* Add reaction button */}
        <button
          onClick={() => setShowAll(!showAll)}
          className={`
            inline-flex items-center justify-center rounded-full
            border border-dashed border-gray-300 text-gray-400
            hover:border-gray-400 hover:text-gray-500 hover:bg-gray-50
            transition-colors
            ${compact ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'}
          `}
          title="Agregar reaccion"
        >
          +
        </button>
      </div>

      {/* Reaction picker (expanded) */}
      {showAll && (
        <div
          className="
            flex flex-wrap gap-2 p-3 rounded-xl
            bg-white border border-gray-200 shadow-lg
          "
          role="group"
          aria-label="Elegir reaccion"
        >
          {allTypes.map((config) => {
            const isActive = userReactions.includes(config.key)

            return (
              <button
                key={config.key}
                onClick={() => {
                  onToggleReaction(config.key)
                  setShowAll(false)
                }}
                className={`
                  group relative flex flex-col items-center gap-1
                  p-2 rounded-lg transition-all
                  ${reducedMotion ? 'duration-0' : 'duration-150'}
                  ${isActive
                    ? 'bg-opacity-15 ring-2 ring-opacity-30'
                    : 'hover:bg-gray-50'
                  }
                `}
                style={{
                  backgroundColor: isActive ? `${config.color}15` : undefined,
                  ringColor: isActive ? config.color : undefined,
                }}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {config.emoji}
                </span>
                <span className="text-[10px] text-gray-600 max-w-[60px] text-center leading-tight">
                  {config.label}
                </span>

                {/* Full description tooltip */}
                <span
                  className="
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    px-2 py-1 rounded text-xs text-white bg-gray-800
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none whitespace-nowrap z-10 max-w-[200px]
                    text-center
                  "
                >
                  {config.description}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
