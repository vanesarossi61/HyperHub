/**
 * Battery Middleware - Controls message/notification delivery based on social battery level.
 *
 * GREEN:  Immediate delivery
 * YELLOW: Delayed delivery (configurable, default 5 min)
 * RED:    Queued in Redis for later consumption
 * LURKER: Silently rejected
 */

import { redis } from './redis'
import { BATTERY_MIDDLEWARE_CONFIG } from '@hyperhub/shared'
import type { BatteryLevelType } from '@hyperhub/shared'

export interface DeliveryPayload {
  type: 'message' | 'notification' | 'mention'
  fromUserId: string
  toUserId: string
  content: string
  metadata?: Record<string, unknown>
}

export interface DeliveryResult {
  action: 'delivered' | 'delayed' | 'queued' | 'rejected'
  batteryLevel: BatteryLevelType
  delayMs?: number
  queueKey?: string
  message: string
}

const REDIS_QUEUE_PREFIX = 'battery:queue:'
const REDIS_DELAY_PREFIX = 'battery:delay:'

/**
 * Process a delivery based on the target user's battery level.
 */
export async function processBatteryDelivery(
  targetBatteryLevel: BatteryLevelType,
  payload: DeliveryPayload
): Promise<DeliveryResult> {
  const config = BATTERY_MIDDLEWARE_CONFIG[targetBatteryLevel]

  switch (config.action) {
    case 'deliver':
      return {
        action: 'delivered',
        batteryLevel: targetBatteryLevel,
        message: 'Mensaje entregado inmediatamente',
      }

    case 'delay': {
      const delayMs = config.delayMs ?? 5 * 60 * 1000
      const delayKey = `${REDIS_DELAY_PREFIX}${payload.toUserId}:${Date.now()}`

      try {
        // Store in Redis with TTL matching the delay
        await redis.set(
          delayKey,
          JSON.stringify({
            ...payload,
            scheduledFor: Date.now() + delayMs,
            createdAt: Date.now(),
          }),
          'PX',
          delayMs + 60000 // TTL = delay + 1 min buffer
        )
      } catch (err) {
        console.error('[BatteryMiddleware] Failed to store delayed message:', err)
        // Fallback: deliver immediately if Redis fails
        return {
          action: 'delivered',
          batteryLevel: targetBatteryLevel,
          message: 'Mensaje entregado (Redis no disponible para delay)',
        }
      }

      return {
        action: 'delayed',
        batteryLevel: targetBatteryLevel,
        delayMs,
        message: `Mensaje sera entregado en ${Math.round(delayMs / 60000)} minutos`,
      }
    }

    case 'queue': {
      const queueKey = `${REDIS_QUEUE_PREFIX}${payload.toUserId}`

      try {
        // Push to a list (FIFO queue)
        await redis.rpush(
          queueKey,
          JSON.stringify({
            ...payload,
            queuedAt: Date.now(),
          })
        )
        // Set TTL of 7 days on the queue
        await redis.expire(queueKey, 7 * 24 * 60 * 60)
      } catch (err) {
        console.error('[BatteryMiddleware] Failed to queue message:', err)
        return {
          action: 'queued',
          batteryLevel: targetBatteryLevel,
          queueKey,
          message: 'Error al encolar mensaje (Redis no disponible)',
        }
      }

      return {
        action: 'queued',
        batteryLevel: targetBatteryLevel,
        queueKey,
        message: 'Mensaje guardado en cola. Se entregara cuando el usuario tenga mas energia.',
      }
    }

    case 'reject':
      return {
        action: 'rejected',
        batteryLevel: targetBatteryLevel,
        message: 'Usuario en Modo Fantasma. Mensaje rechazado silenciosamente.',
      }

    default:
      return {
        action: 'delivered',
        batteryLevel: targetBatteryLevel,
        message: 'Accion desconocida, entregado por defecto',
      }
  }
}

/**
 * Flush queued messages for a user (called when battery level improves).
 * Returns the queued payloads.
 */
export async function flushBatteryQueue(userId: string): Promise<DeliveryPayload[]> {
  const queueKey = `${REDIS_QUEUE_PREFIX}${userId}`

  try {
    const items = await redis.lrange(queueKey, 0, -1)
    if (items.length > 0) {
      await redis.del(queueKey)
      return items.map((item) => JSON.parse(item) as DeliveryPayload)
    }
  } catch (err) {
    console.error('[BatteryMiddleware] Failed to flush queue:', err)
  }

  return []
}

/**
 * Get count of queued messages for a user.
 */
export async function getQueuedCount(userId: string): Promise<number> {
  const queueKey = `${REDIS_QUEUE_PREFIX}${userId}`

  try {
    return await redis.llen(queueKey)
  } catch (err) {
    console.error('[BatteryMiddleware] Failed to get queue count:', err)
    return 0
  }
}
