/**
 * tRPC + React Query Provider for HyperHub
 *
 * Place at: apps/web/src/components/providers/TRPCProvider.tsx
 *
 * Wrap your root layout with this provider to enable tRPC hooks.
 *
 * Usage in apps/web/src/app/layout.tsx:
 *   import { TRPCProvider } from '~/components/providers/TRPCProvider'
 *   ...
 *   <TRPCProvider>{children}</TRPCProvider>
 */
'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import superjson from 'superjson'
import { trpc } from '~/lib/trpc'

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // browser: relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus for ADHD-friendly UX
            // (avoids jarring content shifts)
            refetchOnWindowFocus: false,
            // Stale time of 30s -- good balance for messaging
            staleTime: 30 * 1000,
            // Retry once on failure
            retry: 1,
          },
        },
      }),
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
