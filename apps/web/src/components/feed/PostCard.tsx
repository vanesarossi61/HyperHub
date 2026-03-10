'use client'

import { useState } from 'react'
import { BATTERY_LEVELS, POST_LIMITS } from '@hyperhub/shared'
import type { PostPublic, ReactionTypeValue } from '@hyperhub/shared'
import { ToneTagBadge } from './ToneTagBadge'
import { ReactionBar } from './ReactionBar'
import { BionicText } from './BionicText'

// ============================================================
// PostCard -- Main feed card for a post
// ============================================================

interface PostCardProps {
  post: PostPublic
  onToggleReaction: (postId: string, type: ReactionTypeValue) => void
  onToggleBookmark: (postId: string) => void
  onGenerateTldr: (postId: string) => Promise<void>
  onDelete?: (postId: string) => void
  bionicReadingEnabled?: boolean
  reducedMotion?: boolean
  isOwnPost?: boolean
}

export function PostCard({
  post,
  onToggleReaction,
  onToggleBookmark,
  onGenerateTldr,
  onDelete,
  bionicReadingEnabled = false,
  reducedMotion = true,
  isOwnPost = false,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoadingTldr, setIsLoadingTldr] = useState(false)
  const [showTldr, setShowTldr] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const batteryConfig = post.author.socialBattery
    ? BATTERY_LEVELS[post.author.socialBattery.level]
    : null

  const isLongPost = post.content.length > POST_LIMITS.previewLength
  const displayContent = isExpanded ? post.content : post.content.slice(0, POST_LIMITS.previewLength)
  const readingTime = Math.ceil(post.wordCount / 200)

  const handleTldr = async () => {
    if (showTldr && post.tldrSummary) {
      setShowTldr(false)
      return
    }
    setIsLoadingTldr(true)
    await onGenerateTldr(post.id)
    setShowTldr(true)
    setIsLoadingTldr(false)
  }

  return (
    <article
      className={`
        bg-white rounded-2xl border border-gray-200 shadow-sm
        hover:shadow-md transition-shadow
        ${post.pinned ? 'ring-2 ring-amber-200 border-amber-300' : ''}
      `}
    >
      {/* Pinned indicator */}
      {post.pinned && (
        <div className="px-4 pt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
          <span aria-hidden="true">\u{1F4CC}</span> Post fijado
        </div>
      )}

      {/* Header: Author + Battery + Menu */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {post.author.profile?.displayName?.[0] || post.author.username?.[0] || '?'}
            </div>
            {/* Battery dot */}
            {batteryConfig && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                style={{ backgroundColor: batteryConfig.color }}
                title={`${batteryConfig.label}`}
              />
            )}
          </div>

          {/* Name + meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900 truncate">
                {post.author.profile?.displayName || post.author.username || 'Anonimo'}
              </span>
              {post.author.profile?.pronouns && (
                <span className="text-xs text-gray-400">
                  ({post.author.profile.pronouns})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <time dateTime={post.createdAt}>
                {formatTimeAgo(post.createdAt)}
              </time>
              <span>\u{00B7}</span>
              <span>{readingTime} min lectura</span>
              {post.isInfoDump && (
                <>
                  <span>\u{00B7}</span>
                  <span className="text-green-600 font-medium">Info Dump</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            \u{22EF}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
              <button
                onClick={() => { onToggleBookmark(post.id); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                {post.isBookmarked ? 'Quitar bookmark' : 'Guardar bookmark'}
              </button>
              {isOwnPost && onDelete && (
                <button
                  onClick={() => { onDelete(post.id); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Eliminar post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tone Tag */}
      <div className="px-4 pb-2">
        <ToneTagBadge toneTag={post.toneTag} size="sm" />
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="px-4 pb-1 text-lg font-semibold text-gray-900">
          {post.title}
        </h3>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          <BionicText
            text={displayContent}
            enabled={bionicReadingEnabled}
          />
          {isLongPost && !isExpanded && (
            <span className="text-gray-400">...</span>
          )}
        </div>
        {isLongPost && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            {isExpanded ? 'Ver menos' : 'Ver todo'}
          </button>
        )}
      </div>

      {/* TL;DR Section */}
      {post.wordCount >= POST_LIMITS.tldrMinWords && (
        <div className="px-4 pb-3">
          <button
            onClick={handleTldr}
            disabled={isLoadingTldr}
            className={`
              text-xs font-medium px-3 py-1.5 rounded-lg
              transition-colors
              ${showTldr && post.tldrSummary
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${isLoadingTldr ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            {isLoadingTldr ? 'Resumiendo...' : showTldr ? 'Ocultar TL;DR' : 'TL;DR (Resumen IA)'}
          </button>

          {showTldr && post.tldrSummary && (
            <div className="mt-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
              <p className="text-sm text-purple-800">{post.tldrSummary}</p>
            </div>
          )}

          {isLoadingTldr && (
            <div className="mt-2 p-3 rounded-xl bg-gray-50 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          )}
        </div>
      )}

      {/* Hyperfoci tags */}
      {post.hyperfoci.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {post.hyperfoci.map((hf) => (
            <span
              key={hf}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              # {hf}
            </span>
          ))}
        </div>
      )}

      {/* Reactions */}
      <div className="px-4 pb-3">
        <ReactionBar
          reactions={post.reactions}
          userReactions={post.userReactions}
          onToggleReaction={(type) => onToggleReaction(post.id, type)}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Footer: Comment count + Bookmark */}
      <div className="px-4 pb-3 pt-1 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>{post.commentCount} comentario{post.commentCount !== 1 ? 's' : ''}</span>
        <button
          onClick={() => onToggleBookmark(post.id)}
          className={`
            flex items-center gap-1 transition-colors
            ${post.isBookmarked ? 'text-amber-500' : 'hover:text-gray-600'}
          `}
          title={post.isBookmarked ? 'Quitar bookmark' : 'Guardar'}
        >
          {post.isBookmarked ? '\u{1F516}' : '\u{1F4D1}'}
        </button>
      </div>
    </article>
  )
}

// ============================================================
// Helpers
// ============================================================

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin}m`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `hace ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `hace ${diffDays}d`

  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}
