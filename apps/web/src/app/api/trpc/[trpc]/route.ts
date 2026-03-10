/**
 * Next.js App Router API Route Handler for tRPC
 * 
 * Place at: apps/web/src/app/api/trpc/[trpc]/route.ts
 * 
 * Handles all tRPC requests via the fetch adapter.
 * @see https://trpc.io/docs/server/adapters/fetch
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }
