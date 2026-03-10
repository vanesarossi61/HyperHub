"use client"

import { useState, useRef, useEffect } from "react"
import { useSocialBattery } from "@/hooks/useSocialBattery"
import { BATTERY_LEVELS } from "@hyperhub/shared"
import type { BatteryLevelType } from "@hyperhub/shared"

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "justo ahora"
  if (diffMin < 60) return `hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`
  return `hace ${Math.floor(diffH / 24)}d`
}

export function SocialBatteryIndicator() {
  const { level, config, history, updateLevel, isLoading } = useSocialBattery()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevLevelRef = useRef(level)

  // Animate on level change
  useEffect(() => {
    if (prevLevelRef.current !== level) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 600)
      prevLevelRef.current = level
      return () => clearTimeout(timer)
    }
  }, [level])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowHistory(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentLevel = BATTERY_LEVELS[level]
  const lastChanged = config?.lastLevelChange ? timeAgo(config.lastLevelChange) : ""

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Battery Circle Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowHistory(false) }}
        disabled={isLoading}
        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--muted)] w-full"
        aria-label={`Bateria Social: ${currentLevel.label}`}
        title={`${currentLevel.label} - ${currentLevel.description}${lastChanged ? ` (${lastChanged})` : ""}`}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
            isAnimating ? "scale-125" : "scale-100"
          }`}
          style={{
            backgroundColor: currentLevel.bgColor,
            border: `2px solid ${currentLevel.color}`,
            boxShadow: isAnimating ? `0 0 12px ${currentLevel.color}40` : "none",
          }}
        >
          <div
            className={`h-3 w-3 rounded-full transition-all ${
              isAnimating ? "scale-110" : "scale-100"
            }`}
            style={{ backgroundColor: currentLevel.color }}
          />
        </div>
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[var(--foreground)]">
              {currentLevel.label}
            </span>
            {config?.manualOverride && (
              <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[8px] font-medium text-[var(--muted-foreground)]">
                Manual
              </span>
            )}
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {lastChanged ? `Bateria Social - ${lastChanged}` : "Bateria Social"}
          </span>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-2 shadow-lg z-50">
          {!showHistory ? (
            <>
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                  Como te sientes ahora?
                </p>
                {history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-[10px] text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Ver historial
                  </button>
                )}
              </div>
              {(Object.keys(BATTERY_LEVELS) as BatteryLevelType[]).map((key) => {
                const batteryLevel = BATTERY_LEVELS[key]
                const isActive = level === key

                return (
                  <button
                    key={key}
                    onClick={() => {
                      updateLevel(key)
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                      isActive ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"
                    }`}
                  >
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: batteryLevel.bgColor,
                        border: `2px solid ${batteryLevel.color}`,
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: batteryLevel.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {batteryLevel.label}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {batteryLevel.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <span className="text-xs font-medium text-brand-600">Activo</span>
                      ) : (
                        <span
                          className="inline-block h-2 w-2 rounded-full opacity-40"
                          style={{ backgroundColor: batteryLevel.color }}
                        />
                      )}
                    </div>
                  </button>
                )
              })}
              {/* Delivery mode hint */}
              <div className="mt-2 px-2 py-1.5 rounded-lg bg-[var(--muted)]">
                <p className="text-[10px] text-[var(--muted-foreground)] text-center">
                  {level === "GREEN" && "Los mensajes llegan inmediatamente"}
                  {level === "YELLOW" && "Los mensajes se demoran 5 min antes de llegar"}
                  {level === "RED" && "Los mensajes se guardan en cola para despues"}
                  {level === "LURKER" && "Eres invisible. Nadie te puede contactar"}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* History view */}
              <div className="flex items-center justify-between px-2 mb-2">
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Volver
                </button>
                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                  Historial reciente
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {history.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs"
                  >
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: BATTERY_LEVELS[entry.fromLevel].color }}
                    />
                    <span className="text-[var(--muted-foreground)]">-&gt;</span>
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: BATTERY_LEVELS[entry.toLevel].color }}
                    />
                    <span className="text-[var(--muted-foreground)] flex-1">
                      {entry.reason === "manual" ? "Manual" : entry.reason === "auto_decay" ? "Auto-decay" : entry.reason === "schedule" ? "Horario" : entry.reason}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {timeAgo(entry.createdAt)}
                    </span>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
                    Sin historial aun
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
