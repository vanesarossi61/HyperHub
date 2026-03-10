/**
 * tRPC Client Configuration for HyperHub
 *
 * Place at: apps/web/src/lib/trpc.ts
 *
 * Provides the typed tRPC React hooks used throughout the app.
 * @see https://trpc.io/docs/client/react
 */
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '~/server/api/root'

/**
 * Type-safe tRPC React hooks.
 *
 * Usage in components:
 *   import { trpc } from '~/lib/trpc'
 *   const { data } = trpc.messages.getConversations.useQuery({ cursor: null, limit: 20 })
 */
export const trpc = createTRPCReact<AppRouter>()
