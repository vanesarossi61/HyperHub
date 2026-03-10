'use client'

import { useState, useCallback } from 'react'
import type { CreatePostRequest, ApiResponse } from '@hyperhub/shared'
import { useFeed } from '@/hooks/useFeed'
import { useAntiRabbitHole } from '@/hooks/useAntiRabbitHole'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposer } from '@/components/feed/PostComposer'
import { FeedFilters } from '@/components/feed/FeedFilters'
import { AntiRabbitHoleNudge, BreakSuggestion } from '@/components/feed/AntiRabbitHole'

export default function FeedPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bionicReading, setBionicReading] = useState(false)

  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    filters,
    totalEstimate,
    loadMore,
    refresh,
    setFilters,
    toggleReaction,
    toggleBookmark,
  } = useFeed({ initialFilters: { sortBy: 'dopamine' } })

  const {
    minutesElapsed,
    showNudge,
    showBreakSuggestion,
    nudgeMessage,
    dismissNudge,
    dismissBreak,
    trackPostView,
    resetSession,
  } = useAntiRabbitHole()

  const handleSubmitPost = useCallback(async (postData: CreatePostRequest) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
      const data: ApiResponse<{ id: string }> = await res.json()
      if (!data.success) throw new Error(data.error || 'Error al publicar')
      await refresh()
    } finally {
      setIsSubmitting(false)
    }
  }, [refresh])

  const handleTakeBreak = useCallback(() => {
    dismissNudge()
    // Could navigate to a break screen or show break suggestion
  }, [dismissNudge])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tu Feed
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {totalEstimate > 0
              ? `${totalEstimate} posts para explorar`
              : 'Comparte algo con la comunidad'
            }
          </p>
        </div>

        {/* Bionic reading toggle */}
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Lectura bionica
          </span>
          <input
            type="checkbox"
            checked={bionicReading}
            onChange={(e) => setBionicReading(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
        </label>
      </div>

      {/* Post Composer */}
      <PostComposer onSubmit={handleSubmitPost} isSubmitting={isSubmitting} />

      {/* Filters */}
      <FeedFilters filters={filters} onFiltersChange={setFilters} />

      {/* Anti-Rabbit Hole Nudge */}
      {showNudge && (
        <AntiRabbitHoleNudge
          message={nudgeMessage}
          minutesElapsed={minutesElapsed}
          onDismiss={dismissNudge}
          onTakeBreak={handleTakeBreak}
        />
      )}

      {/* Feed */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm text-indigo-500 hover:text-indigo-600"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-3/5 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">\u{1F331}</span>
          <p className="text-gray-500 dark:text-gray-400">
            Todavia no hay posts. Se el primero en compartir algo!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleReaction={toggleReaction}
              onToggleBookmark={toggleBookmark}
              bionicReadingEnabled={bionicReading}
              onPostVisible={trackPostView}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? 'Cargando...' : 'Cargar mas posts'}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-4">
              Llegaste al final. Quizas es un buen momento para un descanso \u{2615}
            </p>
          )}
        </div>
      )}

      {/* Break Suggestion Modal */}
      {showBreakSuggestion && (
        <BreakSuggestion
          onDismiss={dismissBreak}
          onActivitySelected={(activity, duration) => {
            console.log(`Break: ${activity} (${duration} min)`)
          }}
          onResetSession={resetSession}
        />
      )}
    </div>
  )
}
