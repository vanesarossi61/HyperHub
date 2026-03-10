/**
 * Root tRPC Router for HyperHub
 *
 * Merges all sub-routers into the app router.
 * This is the single entry point that the API route handler uses.
 *
 * @see https://trpc.io/docs/server/merging-routers
 */
import { createTRPCRouter } from '~/server/api/trpc'
import { messagesRouter } from '~/server/api/routers/messages'

/**
 * App Router
 *
 * All sub-routers are merged here. Add new routers as the app grows:
 *   - Phase 2-3 (users, posts) can be migrated from REST to tRPC here
 *   - Phase 5 (Radar) will add its router here
 */
export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  // Phase 5: radar: radarRouter,
  // Future: users: usersRouter,
  // Future: posts: postsRouter,
})

/** Type-safe router type for client-side inference. */
export type AppRouter = typeof appRouter
