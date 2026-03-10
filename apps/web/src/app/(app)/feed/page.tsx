'use client'

import { useFeed } from '@/hooks/useFeed'
import { PostCard } from '@/components/feed/PostCard'
import { PostComposer } from '@/components/feed/PostComposer'
import { FeedFilters } from '@/components/feed/FeedFilters'
import { AntiRabbitHole } from '@/components/feed/AntiRabbitHole'
import { useEffect, useRef, useCallback } from 'react'
import { FEED_CONFIG } from '@hyperhub/shared'

// ============================================================
// Feed Page -- Main feed with infinite scroll, filters, composer
// ============================================================

export default function FeedPage() {
  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    filters,
    sort,
    setFilters,
    setSort,
    loadMore,
    refresh,
    createPost,
    deletePost,
    toggleReaction,
    toggleBookmark,
    generateTldr,
  } = useFeed({
    initialSort: 'recent',
    pageSize: FEED_CONFIG.defaultPageSize,
  })

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        loadMore()
      }
    },
    [hasMore, isLoadingMore, loadMore]
  )

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node) return

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [handleObserver])

  // TODO: Get from user profile/session
  const userHyperfoci = ['acuaponia', 'mitologia nordica', 'rust programming']
  const bionicReadingEnabled = false
  const reducedMotion = true

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tu espacio seguro para compartir, aprender y conectar
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar: Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              <FeedFilters
                filters={filters}
                sort={sort}
                onFiltersChange={setFilters}
                onSortChange={setSort}
                userHyperfoci={userHyperfoci}
              />

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Comunidad
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Tus hiperfocos activos: {userHyperfoci.length}</p>
                  <p>{posts.length} posts visibles</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <main className="flex-1 min-w-0 max-w-2xl">
            {/* Post Composer */}
            <div className="mb-6">
              <PostComposer
                onSubmit={createPost}
                userHyperfoci={userHyperfoci}
                isCompact
              />
            </div>

            {/* Mobile filters toggle */}
            <div className="lg:hidden mb-4">
              <FeedFilters
                filters={filters}
                sort={sort}
                onFiltersChange={setFilters}
                onSortChange={setSort}
                userHyperfoci={userHyperfoci}
                isCollapsed
              />
            </div>

            {/* Error state */}
            {error && (
              <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
                <p>{error}</p>
                <button
                  onClick={refresh}
                  className="mt-2 text-red-600 underline text-xs"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                        <div className="h-2 w-16 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-100 rounded" />
                      <div className="h-3 w-2/3 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts list */}
            {!isLoading && (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-4xl mb-3">\u{1F331}</p>
                    <p className="text-gray-500">
                      No hay posts todavia. Se el primero en compartir algo!
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onToggleReaction={toggleReaction}
                      onToggleBookmark={toggleBookmark}
                      onGenerateTldr={async (id) => { await generateTldr(id) }}
                      onDelete={deletePost}
                      bionicReadingEnabled={bionicReadingEnabled}
                      reducedMotion={reducedMotion}
                    />
                  ))
                )}

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="h-4" />

                {/* Loading more */}
                {isLoadingMore && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      Cargando mas posts...
                    </div>
                  </div>
                )}

                {/* End of feed */}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>Llegaste al final del feed. Hora de tomar agua? \u{1F4A7}</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Anti Rabbit Hole nudges */}
      <AntiRabbitHole enabled />
    </div>
  )
}
