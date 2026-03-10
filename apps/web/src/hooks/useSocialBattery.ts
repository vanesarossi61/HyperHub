"use client"

import { useState, useEffect, useCallback } from "react"
import type { BatteryLevelType, BatteryHistoryEntry } from "@hyperhub/shared"

interface BatteryConfig {
  autoDecayEnabled: boolean
  decayRateMinutes: number
  manualOverride: boolean
  autoLurkerStart: string | null
  autoLurkerEnd: string | null
  lastLevelChange: string
}

interface UseSocialBatteryReturn {
  level: BatteryLevelType
  config: BatteryConfig | null
  history: BatteryHistoryEntry[]
  updateLevel: (newLevel: BatteryLevelType) => void
  updateConfig: (updates: Partial<BatteryConfig>) => void
  isLoading: boolean
  error: string | null
}

const DEFAULT_CONFIG: BatteryConfig = {
  autoDecayEnabled: true,
  decayRateMinutes: 120,
  manualOverride: false,
  autoLurkerStart: null,
  autoLurkerEnd: null,
  lastLevelChange: new Date().toISOString(),
}

export function useSocialBattery(): UseSocialBatteryReturn {
  const [level, setLevel] = useState<BatteryLevelType>("GREEN")
  const [config, setConfig] = useState<BatteryConfig | null>(null)
  const [history, setHistory] = useState<BatteryHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current battery level + history
  useEffect(() => {
    async function fetchBattery() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/battery")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            const { battery, history: hist } = data.data
            if (battery) {
              setLevel(battery.level)
              setConfig({
                autoDecayEnabled: battery.autoDecayEnabled ?? DEFAULT_CONFIG.autoDecayEnabled,
                decayRateMinutes: battery.decayRateMinutes ?? DEFAULT_CONFIG.decayRateMinutes,
                manualOverride: battery.manualOverride ?? DEFAULT_CONFIG.manualOverride,
                autoLurkerStart: battery.autoLurkerStart ?? null,
                autoLurkerEnd: battery.autoLurkerEnd ?? null,
                lastLevelChange: battery.lastLevelChange ?? new Date().toISOString(),
              })
            }
            if (hist) {
              setHistory(hist)
            }
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
        body: JSON.stringify({ level: newLevel, manualOverride: true }),
      })

      if (!res.ok) {
        throw new Error("Failed to update")
      }

      // Add to local history
      if (previousLevel !== newLevel) {
        setHistory((prev) => [
          {
            id: `temp-${Date.now()}`,
            fromLevel: previousLevel,
            toLevel: newLevel,
            reason: "manual",
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }

      // Update config
      setConfig((prev) => prev ? { ...prev, manualOverride: true, lastLevelChange: new Date().toISOString() } : prev)
    } catch (err) {
      console.error("Failed to update battery:", err)
      setLevel(previousLevel) // Rollback
      setError("No se pudo actualizar el nivel de bateria")
    }
  }, [level])

  // Update battery config
  const updateConfig = useCallback(async (updates: Partial<BatteryConfig>) => {
    const previous = config ? { ...config } : null
    setConfig((prev) => prev ? { ...prev, ...updates } : { ...DEFAULT_CONFIG, ...updates })
    setError(null)

    try {
      const res = await fetch("/api/battery/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error("Failed to update config")
      }
    } catch (err) {
      console.error("Failed to update battery config:", err)
      if (previous) setConfig(previous)
      setError("No se pudo actualizar la configuracion de bateria")
    }
  }, [config])

  return { level, config, history, updateLevel, updateConfig, isLoading, error }
}
