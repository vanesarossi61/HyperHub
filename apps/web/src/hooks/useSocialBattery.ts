"use client"

import { useState, useEffect, useCallback } from "react"
import type { BatteryLevelType } from "@hyperhub/shared"

interface UseSocialBatteryReturn {
  level: BatteryLevelType
  updateLevel: (newLevel: BatteryLevelType) => void
  isLoading: boolean
  error: string | null
}

export function useSocialBattery(): UseSocialBatteryReturn {
  const [level, setLevel] = useState<BatteryLevelType>("GREEN")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current battery level
  useEffect(() => {
    async function fetchBattery() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/battery")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data?.level) {
            setLevel(data.data.level)
          }
        }
      } catch (err) {
        console.error("Failed to fetch battery:", err)
        setError("No se pudo cargar el nivel de bateria")
      } finally {
        setIsLoading(false)
      }
    }
    fetchBattery()
  }, [])

  // Update battery level
  const updateLevel = useCallback(async (newLevel: BatteryLevelType) => {
    const previousLevel = level
    setLevel(newLevel) // Optimistic update
    setError(null)

    try {
      const res = await fetch("/api/battery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel }),
      })

      if (!res.ok) {
        throw new Error("Failed to update")
      }
    } catch (err) {
      console.error("Failed to update battery:", err)
      setLevel(previousLevel) // Rollback
      setError("No se pudo actualizar el nivel de bateria")
    }
  }, [level])

  return { level, updateLevel, isLoading, error }
}
