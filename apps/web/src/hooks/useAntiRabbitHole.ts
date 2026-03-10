'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ANTI_RABBIT_HOLE_CONFIG } from '@hyperhub/shared'

// ============================================================
// useAntiRabbitHole -- Gentle time-awareness nudges
// ============================================================

type NudgeLevel = 'none' | 'soft' | 'medium' | 'strong'

interface UseAntiRabbitHoleReturn {
  nudgeLevel: NudgeLevel
  minutesActive: number
  currentMessage: string | null
  isDismissed: boolean
  dismiss: () => void
  resetTimer: () => void
  pause: () => void
  resume: () => void
}

interface UseAntiRabbitHoleOptions {
  enabled?: boolean
  onNudge?: (level: NudgeLevel, message: string) => void
}

export function useAntiRabbitHole(
  options: UseAntiRabbitHoleOptions = {}
): UseAntiRabbitHoleReturn {
  const { enabled = true, onNudge } = options

  const [minutesActive, setMinutesActive] = useState(0)
  const [nudgeLevel, setNudgeLevel] = useState<NudgeLevel>('none')
  const [currentMessage, setCurrentMessage] = useState<string | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const startTimeRef = useRef<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastNudgeLevelRef = useRef<NudgeLevel>('none')

  // Pick a random message for the nudge level
  const getRandomMessage = useCallback((level: NudgeLevel): string | null => {
    const config = ANTI_RABBIT_HOLE_CONFIG
    let messages: readonly string[]

    switch (level) {
      case 'soft':
        messages = config.messages.soft
        break
      case 'medium':
        messages = config.messages.medium
        break
      case 'strong':
        messages = config.messages.strong
        break
      default:
        return null
    }

    return messages[Math.floor(Math.random() * messages.length)] || null
  }, [])

  // Determine nudge level based on minutes
  const calculateNudgeLevel = useCallback((minutes: number): NudgeLevel => {
    const config = ANTI_RABBIT_HOLE_CONFIG
    if (minutes >= config.strongNudgeMinutes) return 'strong'
    if (minutes >= config.mediumNudgeMinutes) return 'medium'
    if (minutes >= config.softNudgeMinutes) return 'soft'
    return 'none'
  }, [])

  // Timer tick
  useEffect(() => {
    if (!enabled || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000)
      setMinutesActive(elapsed)

      const newLevel = calculateNudgeLevel(elapsed)

      // Only nudge when level changes (don't spam)
      if (newLevel !== lastNudgeLevelRef.current && newLevel !== 'none') {
        lastNudgeLevelRef.current = newLevel
        setNudgeLevel(newLevel)
        setIsDismissed(false)

        const message = getRandomMessage(newLevel)
        setCurrentMessage(message)

        if (message && onNudge) {
          onNudge(newLevel, message)
        }
      }
    }, 60000) // Check every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, isPaused, calculateNudgeLevel, getRandomMessage, onNudge])

  // Dismiss current nudge
  const dismiss = useCallback(() => {
    setIsDismissed(true)
    setCurrentMessage(null)
  }, [])

  // Reset timer (user took a break)
  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    setMinutesActive(0)
    setNudgeLevel('none')
    setCurrentMessage(null)
    setIsDismissed(false)
    lastNudgeLevelRef.current = 'none'
  }, [])

  // Pause/resume
  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  return {
    nudgeLevel,
    minutesActive,
    currentMessage,
    isDismissed,
    dismiss,
    resetTimer,
    pause,
    resume,
  }
}
