/**
 * Redis connection helper.
 * Prepared for caching, queues, and real-time features.
 *
 * Install ioredis when ready:
 *   pnpm add ioredis --filter @hyperhub/web
 *
 * Then uncomment and use the client below.
 */

// import Redis from 'ioredis'
//
// const globalForRedis = globalThis as unknown as {
//   redis: Redis | undefined
// }
//
// export const redis =
//   globalForRedis.redis ??
//   new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//     maxRetriesPerRequest: 3,
//     lazyConnect: true,
//   })
//
// if (process.env.NODE_ENV !== 'production') {
//   globalForRedis.redis = redis
// }

export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Placeholder until ioredis is installed
export const redis = null
