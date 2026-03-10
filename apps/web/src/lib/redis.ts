import type Redis from 'ioredis'

let redis: Redis | null = null

if (process.env.REDIS_URL) {
  // Dynamic import to avoid build errors when ioredis is not installed
  const IoRedis = require('ioredis')
  redis = new IoRedis(process.env.REDIS_URL)
}

export { redis }
