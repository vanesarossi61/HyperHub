"use client"

import { useState, useEffect, useCallback } from "react"
import type { SensoryPreferencesConfig, SensoryPreset } from "@hyperhub/shared"
import { SENSORY_DEFAULTS, SENSORY_PRESETS } from "@hyperhub/shared"

interface UseSensoryPreferencesReturn {
  preferences: SensoryPreferencesConfig
  presets: SensoryPreset[]
  updatePreferences: (updates: Partial<SensoryPreferencesConfig>) => void
  applyPreset: (presetKey: string) => void
  isLoading: boolean
  error: string | null
}

export function useSensoryPreferences(): UseSensoryPreferencesReturn {
  const [preferences, setPreferences] =
    useState<SensoryPreferencesConfig>({ ...SENSORY_DEFAULTS, activePreset: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current preferences from dedicated endpoint
  useEffect(() => {
    async function fetchPreferences() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/sensory-preferences")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.preferences) {
            const prefs = data.data.preferences
            setPreferences({
              colorPalette: prefs.colorPalette ?? SENSORY_DEFAULTS.colorPalette,
              animationTolerance: prefs.animationTolerance ?? SENSORY_DEFAULTS.animationTolerance,
              informationDensity: prefs.informationDensity ?? SENSORY_DEFAULTS.informationDensity,
              transitionSpeed: prefs.transitionSpeed ?? SENSORY_DEFAULTS.transitionSpeed,
              fontScale: prefs.fontScale ?? SENSORY_DEFAULTS.fontScale,
              reducedMotion: prefs.reducedMotion ?? SENSORY_DEFAULTS.reducedMotion,
              bionicReadingEnabled: prefs.bionicReadingEnabled ?? SENSORY_DEFAULTS.bionicReadingEnabled,
              dyslexicFontEnabled: prefs.dyslexicFontEnabled ?? SENSORY_DEFAULTS.dyslexicFontEnabled,
              lineSpacing: prefs.lineSpacing ?? SENSORY_DEFAULTS.lineSpacing,
              notificationIntensity: prefs.notificationIntensity ?? SENSORY_DEFAULTS.notificationIntensity,
              soundEnabled: prefs.soundEnabled ?? SENSORY_DEFAULTS.soundEnabled,
              hapticEnabled: prefs.hapticEnabled ?? SENSORY_DEFAULTS.hapticEnabled,
              activePreset: prefs.activePreset ?? null,
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch sensory preferences:", err)
        setError("No se pudieron cargar las preferencias sensoriales")
      } finally {
        setIsLoading(false)
      }
    }
    fetchPreferences()
  }, [])

  // Update preferences via PATCH
  const updatePreferences = useCallback(
    async (updates: Partial<SensoryPreferencesConfig>) => {
      const previous = { ...preferences }
      setPreferences((prev) => ({ ...prev, ...updates, activePreset: null }))
      setError(null)

      try {
        const res = await fetch("/api/sensory-preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...updates, activePreset: null }),
        })

        if (!res.ok) {
          throw new Error("Failed to update preferences")
        }
      } catch (err) {
        console.error("Failed to update preferences:", err)
        setPreferences(previous)
        setError("No se pudieron actualizar las preferencias")
      }
    },
    [preferences]
  )

  // Apply a preset
  const applyPreset = useCallback(
    async (presetKey: string) => {
      const preset = SENSORY_PRESETS.find((p) => p.key === presetKey)
      if (!preset) return

      const previous = { ...preferences }
      const newPrefs = { ...preferences, ...preset.config, activePreset: presetKey }
      setPreferences(newPrefs)
      setError(null)

      try {
        const res = await fetch("/api/sensory-preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...preset.config, activePreset: presetKey }),
        })

        if (!res.ok) {
          throw new Error("Failed to apply preset")
        }
      } catch (err) {
        console.error("Failed to apply preset:", err)
        setPreferences(previous)
        setError("No se pudo aplicar el preset")
      }
    },
    [preferences]
  )

  return { preferences, presets: SENSORY_PRESETS, updatePreferences, applyPreset, isLoading, error }
}
