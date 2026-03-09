"use client"

import { useState, useRef, useEffect } from "react"
import { useSocialBattery } from "@/hooks/useSocialBattery"
import { BATTERY_LEVELS } from "@hyperhub/shared"
import type { BatteryLevelType } from "@hyperhub/shared"

const batteryColors: Record<BatteryLevelType, string> = {
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  RED: "#ef4444",
  LURKER: "#6b7280",
}

const batteryBgColors: Record<BatteryLevelType, string> = {
  GREEN: "#dcfce7",
  YELLOW: "#fef9c3",
  RED: "#fee2e2",
  LURKER: "#f3f4f6",
}

export function SocialBatteryIndicator() {
  const { level, updateLevel, isLoading } = useSocialBattery()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentLevel = BATTERY_LEVELS[level]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Battery Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--muted)] w-full"
        aria-label={`Bateria Social: ${currentLevel.label}`}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{
            backgroundColor: batteryBgColors[level],
            border: `2px solid ${batteryColors[level]}`,
          }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: batteryColors[level] }}
          />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-medium text-[var(--foreground)]">
            {currentLevel.label}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            Bateria Social
          </span>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-2 shadow-lg animate-fade-in">
          <p className="mb-2 px-2 text-xs font-medium text-[var(--muted-foreground)]">
            Como te sientes ahora?
          </p>
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
                  isActive
                    ? "bg-[var(--muted)]"
                    : "hover:bg-[var(--muted)]"
                }`}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: batteryBgColors[key],
                    border: `2px solid ${batteryColors[key]}`,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: batteryColors[key] }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {batteryLevel.label}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {batteryLevel.description}
                  </p>
                </div>
                {isActive && (
                  <div className="text-xs font-medium text-brand-600">
                    Activo
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
