"use client"

import { useState, useEffect, useCallback } from "react"
import type { SensoryPreferencesConfig } from "@hyperhub/shared"
import { SENSORY_DEFAULTS } from "@hyperhub/shared"

interface UseSensoryPreferencesReturn {
  preferences: SensoryPreferencesConfig
  updatePreferences: (updates: Partial<SensoryPreferencesConfig>) => void
  isLoading: boolean
  error: string | null
}

export function useSensoryPreferences(): UseSensoryPreferencesReturn {
  const [preferences, setPreferences] =
    useState<SensoryPreferencesConfig>(SENSORY_DEFAULTS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current preferences
  useEffect(() => {
    async function fetchPreferences() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.sensoryPreferences) {
            const prefs = data.data.sensoryPreferences
            setPreferences({
              colorPalette: prefs.colorPalette ?? SENSORY_DEFAULTS.colorPalette,
              animationLevel: prefs.animationLevel ?? SENSORY_DEFAULTS.animationLevel,
              informationDensity:
                prefs.informationDensity ?? SENSORY_DEFAULTS.informationDensity,
              transitionSpeed: prefs.transitionSpeed ?? SENSORY_DEFAULTS.transitionSpeed,
              fontSize: prefs.fontSize ?? SENSORY_DEFAULTS.fontSize,
              bionicReadingEnabled:
                prefs.bionicReadingEnabled ?? SENSORY_DEFAULTS.bionicReadingEnabled,
              dyslexicFontEnabled:
                prefs.dyslexicFontEnabled ?? SENSORY_DEFAULTS.dyslexicFontEnabled,
              lineSpacing: prefs.lineSpacing ?? SENSORY_DEFAULTS.lineSpacing,
              notificationIntensity:
                prefs.notificationIntensity ?? SENSORY_DEFAULTS.notificationIntensity,
              soundEnabled: prefs.soundEnabled ?? SENSORY_DEFAULTS.soundEnabled,
              hapticEnabled: prefs.hapticEnabled ?? SENSORY_DEFAULTS.hapticEnabled,
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

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<SensoryPreferencesConfig>) => {
      const previous = { ...preferences }
      setPreferences((prev) => ({ ...prev, ...updates }))
      setError(null)

      try {
        // In the future, this will sync to the backend
        // For now, only local state is updated
        console.log("Sensory preferences updated:", updates)
      } catch (err) {
        console.error("Failed to update preferences:", err)
        setPreferences(previous)
        setError("No se pudieron actualizar las preferencias")
      }
    },
    [preferences]
  )

  return { preferences, updatePreferences, isLoading, error }
}
