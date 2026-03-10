import type { PostPublic, DopamineCurationFactors } from '@hyperhub/shared'
import { FEED_CONFIG } from '@hyperhub/shared'

/**
 * Dopamine Curation Algorithm
 * 
 * Optimizes for DISCOVERY, not time-on-screen.
 * Anti-engagement by design: reactions do NOT boost score.
 * 
 * Positive factors:
 *   - Hyperfocus match (x3): posts about user's current hyperfoci
 *   - Freshness (x2): newer posts score higher, decay over time
 *   - Tone preference (x1.5): matches user's preferred tone tags
 * 
 * Anti-bubble penalties:
 *   - Same topic penalty (-1.5): prevents echo chambers
 *   - Same author penalty (-2.0): diversifies voices
 *   - 10% serendipity: random boost for discovery
 */

const { curation, freshnessHalfLifeHours, freshnessMaxDays } = FEED_CONFIG

export function calculateDopamineScore(
  post: PostPublic,
  userHyperfoci: string[],
  recentTopics: string[],
  recentAuthors: string[] = [],
  preferredTones: string[] = []
): number {
  const factors = calculateFactors(post, userHyperfoci, recentTopics, recentAuthors, preferredTones)
  
  return (
    factors.hyperfocusMatch * curation.hyperfocusMatchWeight +
    factors.freshness * curation.freshnessWeight +
    factors.tonePreference * curation.tonePreferenceWeight +
    factors.sameTopicPenalty +
    factors.sameAuthorPenalty +
    factors.serendipity
  )
}

export function calculateFactors(
  post: PostPublic,
  userHyperfoci: string[],
  recentTopics: string[],
  recentAuthors: string[],
  preferredTones: string[]
): DopamineCurationFactors {
  // 1. Hyperfocus match - do any tags match user's current hyperfoci?
  const postTags = post.tags.map((t) => t.name.toLowerCase())
  const hyperfociLower = userHyperfoci.map((h) => h.toLowerCase())
  const matchCount = postTags.filter((tag) =>
    hyperfociLower.some((hf) => tag.includes(hf) || hf.includes(tag))
  ).length
  const hyperfocusMatch = Math.min(matchCount / Math.max(userHyperfoci.length, 1), 1)

  // 2. Freshness - exponential decay based on age
  const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
  const maxAgeHours = freshnessMaxDays * 24
  const freshness = ageHours >= maxAgeHours
    ? 0
    : Math.pow(0.5, ageHours / freshnessHalfLifeHours)

  // 3. Tone preference
  const tonePreference = preferredTones.includes(post.toneTag) ? 1 : 0.3

  // 4. Same topic penalty - reduce score if we've seen too much of this topic
  const topicOverlap = postTags.filter((tag) => recentTopics.includes(tag)).length
  const sameTopicPenalty = topicOverlap > 0 ? curation.sameTopicPenalty * topicOverlap : 0

  // 5. Same author penalty
  const sameAuthorPenalty = recentAuthors.includes(post.author.id)
    ? curation.sameAuthorPenalty
    : 0

  // 6. Serendipity - random factor for discovery
  const serendipity = Math.random() < curation.serendipityFactor
    ? 2 + Math.random() * 3 // Big boost for lucky posts
    : 0

  return {
    hyperfocusMatch,
    freshness,
    tonePreference,
    sameTopicPenalty,
    sameAuthorPenalty,
    serendipity,
  }
}

/**
 * Sort posts using dopamine curation and return with diversity applied
 */
export function curateFeed(
  posts: PostPublic[],
  userHyperfoci: string[],
  preferredTones: string[] = []
): PostPublic[] {
  const recentTopics: string[] = []
  const recentAuthors: string[] = []
  const result: PostPublic[] = []
  const scored = posts.map((post) => ({
    post,
    score: calculateDopamineScore(post, userHyperfoci, recentTopics, recentAuthors, preferredTones),
  }))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Re-rank with diversity: track recent topics/authors to apply penalties
  for (const { post } of scored) {
    result.push(post)
    
    // Track for anti-bubble
    post.tags.forEach((t) => {
      if (!recentTopics.includes(t.name)) recentTopics.push(t.name)
    })
    if (!recentAuthors.includes(post.author.id)) {
      recentAuthors.push(post.author.id)
    }

    // Keep window small for penalty tracking
    if (recentTopics.length > 10) recentTopics.shift()
    if (recentAuthors.length > 5) recentAuthors.shift()
  }

  return result
}
