'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  PostPublic,
  FeedFilters,
  FeedSortOption,
  FeedResponse,
  CreatePostRequest,
  ToggleReactionRequest,
  ReactionTypeValue,
  TldrResponse,
} from '@hyperhub/shared'
import { FEED_CONFIG } from '@hyperhub/shared'

// ============================================================
// useFeed -- Infinite scroll feed with filters & sort
// ============================================================

interface UseFeedOptions {
  initialSort?: FeedSortOption
  initialFilters?: FeedFilters
  pageSize?: number
}

interface UseFeedReturn {
  posts: PostPublic[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  filters: FeedFilters
  sort: FeedSortOption
  setFilters: (filters: FeedFilters) => void
  setSort: (sort: FeedSortOption) => void
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  createPost: (data: CreatePostRequest) => Promise<PostPublic | null>
  deletePost: (postId: string) => Promise<boolean>
  toggleReaction: (postId: string, type: ReactionTypeValue) => Promise<void>
  toggleBookmark: (postId: string) => Promise<void>
  generateTldr: (postId: string) => Promise<TldrResponse | null>
}

export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const {
    initialSort = 'recent',
    initialFilters = {},
    pageSize = FEED_CONFIG.defaultPageSize,
  } = options

  const [posts, setPosts] = useState<PostPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<FeedFilters>(initialFilters)
  const [sort, setSort] = useState<FeedSortOption>(initialSort)
  const cursorRef = useRef<string | null>(null)

  // Build query string from filters
  const buildQuery = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams()
      params.set('limit', String(pageSize))
      params.set('sort', sort)

      if (cursor) params.set('cursor', cursor)
      if (filters.toneTag) params.set('toneTag', filters.toneTag)
      if (filters.hyperfocus) params.set('hyperfocus', filters.hyperfocus)
      if (filters.authorId) params.set('authorId', filters.authorId)
      if (filters.search) params.set('search', filters.search)
      if (filters.isInfoDump !== undefined) params.set('isInfoDump', String(filters.isInfoDump))

      return params.toString()
    },
    [pageSize, sort, filters]
  )

  // Fetch posts
  const fetchPosts = useCallback(
    async (isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true)
        } else {
          setIsLoading(true)
          setError(null)
        }

        const cursor = isLoadMore ? cursorRef.current || undefined : undefined
        const query = buildQuery(cursor)
        const response = await fetch(`/api/posts?${query}`)

        if (!response.ok) {
          throw new Error('Error al cargar el feed')
        }

        const json = await response.json()
        const data: FeedResponse = json.data

        if (isLoadMore) {
          setPosts((prev) => [...prev, ...data.posts])
        } else {
          setPosts(data.posts)
        }

        cursorRef.current = data.nextCursor
        setHasMore(data.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [buildQuery]
  )

  // Initial load & reload on filter/sort change
  useEffect(() => {
    cursorRef.current = null
    fetchPosts(false)
  }, [fetchPosts])

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    await fetchPosts(true)
  }, [fetchPosts, isLoadingMore, hasMore])

  // Refresh feed
  const refresh = useCallback(async () => {
    cursorRef.current = null
    await fetchPosts(false)
  }, [fetchPosts])

  // Create post
  const createPost = useCallback(async (data: CreatePostRequest): Promise<PostPublic | null> => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error || 'Error al crear post')
      }

      const json = await response.json()
      // Prepend new post to feed
      setPosts((prev) => [json.data, ...prev])
      return json.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear post')
      return null
    }
  }, [])

  // Delete post
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar post')
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      return true
    } catch {
      return false
    }
  }, [])

  // Toggle reaction (optimistic update)
  const toggleReaction = useCallback(async (postId: string, type: ReactionTypeValue) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post

        const hasReaction = post.userReactions.includes(type)
        const newUserReactions = hasReaction
          ? post.userReactions.filter((r) => r !== type)
          : [...post.userReactions, type]

        const newReactions = post.reactions.map((r) => {
          if (r.type !== type) return r
          return { ...r, count: hasReaction ? r.count - 1 : r.count + 1 }
        })

        // Add reaction type if it didn't exist
        if (!hasReaction && !newReactions.find((r) => r.type === type)) {
          newReactions.push({ type, count: 1 })
        }

        return {
          ...post,
          userReactions: newUserReactions,
          reactions: newReactions.filter((r) => r.count > 0),
        }
      })
    )

    // API call
    try {
      await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type } as ToggleReactionRequest),
      })
    } catch {
      // Revert on failure by refreshing
      await refresh()
    }
  }, [refresh])

  // Toggle bookmark (optimistic update)
  const toggleBookmark = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    )

    try {
      await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' })
    } catch {
      await refresh()
    }
  }, [refresh])

  // Generate TL;DR
  const generateTldr = useCallback(async (postId: string): Promise<TldrResponse | null> => {
    try {
      const response = await fetch(`/api/posts/${postId}/tldr`, { method: 'POST' })
      if (!response.ok) throw new Error('Error al generar TL;DR')

      const json = await response.json()
      const tldr: TldrResponse = json.data

      // Update post in feed with TL;DR
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, tldrSummary: tldr.summary } : post
        )
      )

      return tldr
    } catch {
      return null
    }
  }, [])

  return {
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
  }
}
