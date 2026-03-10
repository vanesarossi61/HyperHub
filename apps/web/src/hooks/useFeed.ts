'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { PostPublic, FeedFilters, FeedPage, ApiResponse } from '@hyperhub/shared'

interface UseFeedOptions {
  initialFilters?: FeedFilters
  autoLoad?: boolean
}

interface UseFeedReturn {
  posts: PostPublic[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  filters: FeedFilters
  totalEstimate: number
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  setFilters: (filters: FeedFilters) => void
  toggleReaction: (postId: string, type: string) => Promise<void>
  toggleBookmark: (postId: string) => Promise<void>
}

export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const { initialFilters = {}, autoLoad = true } = options

  const [posts, setPosts] = useState<PostPublic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<FeedFilters>(initialFilters)
  const [totalEstimate, setTotalEstimate] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const buildUrl = useCallback(
    (cursorParam: string | null) => {
      const params = new URLSearchParams()
      if (cursorParam) params.set('cursor', cursorParam)
      if (filters.toneTag) params.set('toneTag', filters.toneTag)
      if (filters.tag) params.set('tag', filters.tag)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      return `/api/posts?${params.toString()}`
    },
    [filters]
  )

  const fetchPosts = useCallback(
    async (cursorParam: string | null = null, append = false) => {
      // Cancel previous request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      try {
        const res = await fetch(buildUrl(cursorParam), {
          signal: abortRef.current.signal,
        })
        const data: ApiResponse<FeedPage> = await res.json()

        if (!data.success || !data.data) {
          throw new Error(data.error || 'Error al cargar posts')
        }

        const feed = data.data
        setPosts((prev) => (append ? [...prev, ...feed.posts] : feed.posts))
        setCursor(feed.nextCursor)
        setHasMore(feed.hasMore)
        setTotalEstimate(feed.totalEstimate)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Error de conexion')
        }
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [buildUrl]
  )

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursor) return
    await fetchPosts(cursor, true)
  }, [cursor, hasMore, isLoadingMore, fetchPosts])

  const refresh = useCallback(async () => {
    setCursor(null)
    await fetchPosts(null, false)
  }, [fetchPosts])

  const setFilters = useCallback((newFilters: FeedFilters) => {
    setFiltersState(newFilters)
    setCursor(null)
    setPosts([])
  }, [])

  // Toggle reaction optimistically
  const toggleReaction = useCallback(async (postId: string, type: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        const hasReaction = post.userReactions.includes(type as any)
        return {
          ...post,
          userReactions: hasReaction
            ? post.userReactions.filter((r) => r !== type)
            : [...post.userReactions, type as any],
          reactionCount: post.reactionCount + (hasReaction ? -1 : 1),
          reactions: post.reactions.map((r) =>
            r.type === type
              ? { ...r, count: r.count + (hasReaction ? -1 : 1) }
              : r
          ),
        }
      })
    )

    try {
      await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
    } catch {
      // Revert on error - refresh will fix state
      refresh()
    }
  }, [refresh])

  // Toggle bookmark optimistically
  const toggleBookmark = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        return {
          ...post,
          isBookmarked: !post.isBookmarked,
          bookmarkCount: post.bookmarkCount + (post.isBookmarked ? -1 : 1),
        }
      })
    )

    try {
      await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      refresh()
    }
  }, [refresh])

  // Auto-load and reload on filter change
  useEffect(() => {
    if (autoLoad) {
      fetchPosts(null, false)
    }
    return () => abortRef.current?.abort()
  }, [filters, autoLoad, fetchPosts])

  return {
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
  }
}