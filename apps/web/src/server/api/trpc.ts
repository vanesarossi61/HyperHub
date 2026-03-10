/**
 * tRPC Server Configuration for HyperHub
 * 
 * This file sets up the tRPC context, middleware, and procedure helpers.
 * Used by all routers in apps/web/src/server/api/routers/
 * 
 * @see https://trpc.io/docs/server/context
 */
import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@hyperhub/db'

// ---------------------------------------------------------------------------
// Prisma Singleton (avoid multiple instances in dev with hot-reload)
// ---------------------------------------------------------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * Context available to every tRPC procedure.
 * - `prisma`: Database client
 * - `userId`: Clerk auth user ID (null if unauthenticated)
 */
export interface TRPCContext {
  prisma: PrismaClient
  userId: string | null
}

export const createTRPCContext = async (
  _opts: FetchCreateContextFnOptions,
): Promise<TRPCContext> => {
  const { userId } = await auth()

  return {
    prisma,
    userId,
  }
}

// ---------------------------------------------------------------------------
// tRPC Init
// ---------------------------------------------------------------------------
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/** Enforces that the user is authenticated via Clerk. */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be signed in to perform this action.',
    })
  }

  return next({
    ctx: {
      ...ctx,
      // Narrow userId to non-null for downstream procedures
      userId: ctx.userId,
    },
  })
})

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Create a new tRPC router.
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public procedure -- no auth required.
 * Use for health checks, public data, etc.
 */
export const publicProcedure = t.procedure

/**
 * Protected procedure -- requires Clerk authentication.
 * `ctx.userId` is guaranteed to be non-null.
 * Used by messages router and all user-facing mutations.
 */
export const protectedProcedure = t.procedure.use(enforceAuth)

/**
 * Merge helper for root router.
 */
export const mergeRouters = t.mergeRouters
