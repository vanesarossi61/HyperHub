'use client'

import { useState, useCallback } from 'react'
import type { PostPublic } from '@hyperhub/shared'
import { READING_CONFIG } from '@hyperhub/shared'
import { ToneTagBadge } from './ToneTagBadge'
import { ReactionBar } from './ReactionBar'
import { BionicParagraph } from './BionicText'

interface PostCardProps {
  post: PostPublic
  onToggleReaction: (postId: string, type: string) => Promise<void>
  onToggleBookmark: (postId: string) => Promise<void>
  bionicReadingEnabled?: boolean
  onPostVisible?: () => void
}

export function PostCard({
  post,
  onToggleReaction,
  onToggleBookmark,
  bionicReadingEnabled = false,
  onPostVisible,
}: PostCardProps) {
  const [showTldr, setShowTldr] = useState(false)
  const [tldrText, setTldrText] = useState(post.tldrText)
  const [loadingTldr, setLoadingTldr] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const isLongPost = post.wordCount >= READING_CONFIG.longPostThreshold
  const shouldTruncate = isLongPost && !isExpanded
  const truncatedContent = shouldTruncate
    ? post.content.slice(0, 500) + '...'
    : post.content

  const fetchTldr = useCallback(async () => {
    if (tldrText) {
      setShowTldr(!showTldr)
      return
    }

    setLoadingTldr(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/tldr`)
      const data = await res.json()
      if (data.success && data.data) {
        setTldrText(data.data.tldr)
        setShowTldr(true)
      }
    } catch (err) {
      console.error('TL;DR error:', err)
    } finally {
      setLoadingTldr(false)
    }
  }, [post.id, tldrText, showTldr])

  // Format relative time
  const timeAgo = formatTimeAgo(post.createdAt)

  return (
    <article
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
      onMouseEnter={onPostVisible}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName || 'Avatar'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {post.isAnonymous
                  ? '\u{1F47B}'
                  : (post.author.displayName || post.author.username || '?')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Author info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {post.isAnonymous ? 'Anonimo' : post.author.displayName || post.author.username || 'Usuario'}
              </span>
              {post.author.pronouns && !post.isAnonymous && (
                <span className="text-xs text-gray-400">({post.author.pronouns})</span>
              )}
              {post.author.batteryLevel && !post.isAnonymous && (
                <span className="text-xs" title={`Bateria: ${post.author.batteryLevel}`}>
                  {post.author.batteryLevel === 'GREEN' && '\u{1F7E2}'}
                  {post.author.batteryLevel === 'YELLOW' && '\u{1F7E1}'}
                  {post.author.batteryLevel === 'RED' && '\u{1F534}'}
                  {post.author.batteryLevel === 'LURKER' && '\u{1F47B}'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{timeAgo}</span>
              <ToneTagBadge toneTag={post.toneTag} size="sm" />
            </div>
          </div>

          {/* Bookmark button */}
          <button
            onClick={() => onToggleBookmark(post.id)}
            className={`
              flex-shrink-0 p-1.5 rounded-lg transition-all duration-200
              ${post.isBookmarked
                ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title={post.isBookmarked ? 'Quitar bookmark' : 'Guardar'}
          >
            <svg className="w-5 h-5" fill={post.isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {/* TL;DR section */}
        {isLongPost && (
          <div className="mb-2">
            <button
              onClick={fetchTldr}
              disabled={loadingTldr}
              className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors font-medium"
            >
              {loadingTldr
                ? 'Generando resumen...'
                : showTldr
                  ? 'Ocultar TL;DR'
                  : `TL;DR (${post.wordCount} palabras, ~${Math.ceil(post.readingTimeSeconds / 60)} min)`
              }
            </button>
            {showTldr && tldrText && (
              <div className="mt-1.5 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-sm text-indigo-900 dark:text-indigo-100">
                <span className="font-medium">TL;DR: </span>
                {tldrText}
              </div>
            )}
          </div>
        )}

        {/* Post content with optional bionic reading */}
        <BionicParagraph
          text={truncatedContent}
          enabled={bionicReadingEnabled}
          className="text-sm text-gray-800 dark:text-gray-200"
        />

        {/* Expand/collapse for long posts */}
        {isLongPost && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs text-indigo-500 hover:text-indigo-600 transition-colors font-medium"
          >
            {isExpanded ? 'Ver menos' : 'Ver todo el post'}
          </button>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reactions */}
      <div className="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800">
        <ReactionBar
          postId={post.id}
          reactions={post.reactions}
          userReactions={post.userReactions}
          onToggleReaction={onToggleReaction}
        />
      </div>
    </article>
  )
}

// Helper: format relative time
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}