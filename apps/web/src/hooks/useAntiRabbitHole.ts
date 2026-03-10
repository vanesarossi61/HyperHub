'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ANTI_RABBIT_HOLE } from '@hyperhub/shared'
import type { AntiRabbitHoleConfig } from '@hyperhub/shared'

interface UseAntiRabbitHoleOptions {
  config?: Partial<AntiRabbitHoleConfig>
  onNudge?: (message: string) => void
  onBreakSuggestion?: () => void
}

interface UseAntiRabbitHoleReturn {
  /** Minutes spent in current session */
  minutesElapsed: number
  /** Number of posts scrolled past */
  postsViewed: number
  /** Whether a gentle nudge should be shown */
  showNudge: boolean
  /** Whether a break suggestion should be shown */
  showBreakSuggestion: boolean
  /** Current nudge message (rotating, never guilt-tripping) */
  nudgeMessage: string
  /** Dismiss the current nudge */
  dismissNudge: () => void
  /** Dismiss break suggestion */
  dismissBreak: () => void
  /** Register that a post was scrolled past */
  trackPostView: () => void
  /** Reset the session (e.g., after a break) */
  resetSession: () => void
  /** Pause the timer (e.g., when tab is not visible) */
  pauseTimer: () => void
  /** Resume the timer */
  resumeTimer: () => void
  /** Whether the timer is currently running */
  isActive: boolean
}

export function useAntiRabbitHole(
  options: UseAntiRabbitHoleOptions = {}
): UseAntiRabbitHoleReturn {
  const {
    config: userConfig,
    onNudge,
    onBreakSuggestion,
  } = options

  const config: AntiRabbitHoleConfig = {
    enabled: userConfig?.enabled ?? ANTI_RABBIT_HOLE.enabled,
    sectionTimerMinutes: userConfig?.sectionTimerMinutes ?? ANTI_RABBIT_HOLE.sectionTimerMinutes,
    gentleNudgeAfterPosts: userConfig?.gentleNudgeAfterPosts ?? ANTI_RABBIT_HOLE.gentleNudgeAfterPosts,
    breakSuggestionMinutes: userConfig?.breakSuggestionMinutes ?? ANTI_RABBIT_HOLE.breakSuggestionMinutes,
    neverGuilty: true, // Always true. Never guilt-tripping.
  }

  const [minutesElapsed, setMinutesElapsed] = useState(0)
  const [postsViewed, setPostsViewed] = useState(0)
  const [showNudge, setShowNudge] = useState(false)
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false)
  const [nudgeMessage, setNudgeMessage] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [nudgeDismissedAt, setNudgeDismissedAt] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(Date.now())

  // Pick a random nudge message
  const getRandomNudge = useCallback(() => {
    const messages = ANTI_RABBIT_HOLE.nudgeMessages
    const msg = messages[Math.floor(Math.random() * messages.length)]
    return msg.replace('{minutes}', String(minutesElapsed))
  }, [minutesElapsed])

  // Timer effect
  useEffect(() => {
    if (!config.enabled || !isActive) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000)
      setMinutesElapsed(elapsed)
    }, 30000) // Update every 30 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [config.enabled, isActive])

  // Check for nudge triggers
  useEffect(() => {
    if (!config.enabled) return

    // Time-based nudge
    if (minutesElapsed >= config.sectionTimerMinutes && minutesElapsed - nudgeDismissedAt >= 10) {
      const msg = getRandomNudge()
      setNudgeMessage(msg)
      setShowNudge(true)
      onNudge?.(msg)
    }

    // Break suggestion
    if (minutesElapsed >= config.breakSuggestionMinutes) {
      setShowBreakSuggestion(true)
      onBreakSuggestion?.()
    }
  }, [minutesElapsed, config.enabled, config.sectionTimerMinutes, config.breakSuggestionMinutes, nudgeDismissedAt, getRandomNudge, onNudge, onBreakSuggestion])

  // Post count nudge
  useEffect(() => {
    if (!config.enabled) return

    if (postsViewed > 0 && postsViewed % config.gentleNudgeAfterPosts === 0) {
      const msg = getRandomNudge()
      setNudgeMessage(msg)
      setShowNudge(true)
      onNudge?.(msg)
    }
  }, [postsViewed, config.enabled, config.gentleNudgeAfterPosts, getRandomNudge, onNudge])

  const dismissNudge = useCallback(() => {
    setShowNudge(false)
    setNudgeDismissedAt(minutesElapsed)
  }, [minutesElapsed])

  const dismissBreak = useCallback(() => {
    setShowBreakSuggestion(false)
  }, [])

  const trackPostView = useCallback(() => {
    setPostsViewed((prev) => prev + 1)
  }, [])

  const resetSession = useCallback(() => {
    startTimeRef.current = Date.now()
    setMinutesElapsed(0)
    setPostsViewed(0)
    setShowNudge(false)
    setShowBreakSuggestion(false)
    setNudgeDismissedAt(0)
  }, [])

  const pauseTimer = useCallback(() => setIsActive(false), [])
  const resumeTimer = useCallback(() => setIsActive(true), [])

  return {
    minutesElapsed,
    postsViewed,
    showNudge,
    showBreakSuggestion,
    nudgeMessage,
    dismissNudge,
    dismissBreak,
    trackPostView,
    resetSession,
    pauseTimer,
    resumeTimer,
    isActive,
  }
}