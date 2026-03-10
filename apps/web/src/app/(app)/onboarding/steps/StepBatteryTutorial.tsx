"use client"

import { useState } from "react"
import { BATTERY_LEVELS } from "@hyperhub/shared"
import type { BatteryLevelType } from "@hyperhub/shared"

interface StepBatteryTutorialProps {
  onNext: () => void
  onBack: () => void
}

const BATTERY_ORDER: BatteryLevelType[] = ["GREEN", "YELLOW", "RED", "LURKER"]

export default function StepBatteryTutorial({ onNext, onBack }: StepBatteryTutorialProps) {
  const [demoLevel, setDemoLevel] = useState<BatteryLevelType>("GREEN")
  const [autoDecay, setAutoDecay] = useState(true)
  const [decayRate, setDecayRate] = useState(120)
  const [autoLurkerStart, setAutoLurkerStart] = useState("23:00")
  const [autoLurkerEnd, setAutoLurkerEnd] = useState("08:00")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save battery config
      await fetch("/api/battery/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoDecayEnabled: autoDecay,
          decayRateMinutes: decayRate,
          autoLurkerStart,
          autoLurkerEnd,
        }),
      })

      // Mark onboarding as completed
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingStep: "COMPLETED",
          onboardingCompleted: true,
        }),
      })

      onNext()
    } catch (err) {
      console.error("Failed to save battery config:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const currentLevel = BATTERY_LEVELS[demoLevel]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Tu Bateria Social</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tu bateria social le dice a los demas cuanta energia tienes para interactuar.
          Es tu escudo protector. Nadie puede forzar una interaccion.
        </p>
      </div>

      {/* Interactive Demo */}
      <div className="rounded-xl border border-[var(--border)] p-5">
        <p className="mb-4 text-sm font-medium text-[var(--foreground)]">
          Proba cambiarla!
        </p>
        <div className="flex items-center justify-center gap-4 mb-4">
          {BATTERY_ORDER.map((level) => {
            const info = BATTERY_LEVELS[level]
            const isActive = demoLevel === level
            return (
              <button
                key={level}
                onClick={() => setDemoLevel(level)}
                className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all ${
                  isActive ? "scale-110 shadow-md" : "opacity-60 hover:opacity-80"
                }`}
                style={{
                  backgroundColor: isActive ? info.bgColor : "transparent",
                  border: isActive ? `2px solid ${info.color}` : "2px solid transparent",
                }}
              >
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="text-xs font-medium text-[var(--foreground)]">
                  {info.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Explanation for current level */}
        <div
          className="rounded-lg p-3 text-center transition-all"
          style={{ backgroundColor: currentLevel.bgColor }}
        >
          <p className="text-sm font-medium" style={{ color: currentLevel.color }}>
            {currentLevel.label}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {currentLevel.description}
          </p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)] italic">
            {demoLevel === "GREEN" && "Otros pueden enviarte mensajes y notificaciones normalmente."}
            {demoLevel === "YELLOW" && "Los mensajes se demoran 5 minutos antes de llegarte."}
            {demoLevel === "RED" && "Los mensajes se guardan en cola. Los veras cuando te sientas mejor."}
            {demoLevel === "LURKER" && "Eres invisible. Nadie puede contactarte. Solo observas."}
          </p>
        </div>
      </div>

      {/* Auto-decay config */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Configuracion automatica
        </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoDecay}
            onChange={(e) => setAutoDecay(e.target.checked)}
            className="rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
          />
          <div>
            <p className="text-sm text-[var(--foreground)]">Auto-decay</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              La bateria baja automaticamente con el uso (simula desgaste natural)
            </p>
          </div>
        </label>

        {autoDecay && (
          <div>
            <label className="block text-sm text-[var(--foreground)] mb-1">
              Velocidad de desgaste: {decayRate} minutos
            </label>
            <input
              type="range"
              min={30}
              max={480}
              step={30}
              value={decayRate}
              onChange={(e) => setDecayRate(parseInt(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>Rapido (30min)</span>
              <span>Lento (8h)</span>
            </div>
          </div>
        )}

        {/* Auto lurker schedule */}
        <div>
          <p className="text-sm text-[var(--foreground)] mb-2">
            Horario de descanso automatico
          </p>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Fantasma desde</label>
              <input
                type="time"
                value={autoLurkerStart}
                onChange={(e) => setAutoLurkerStart(e.target.value)}
                className="block rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
              />
            </div>
            <span className="text-[var(--muted-foreground)] mt-4">hasta</span>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Volver a</label>
              <input
                type="time"
                value={autoLurkerEnd}
                onChange={(e) => setAutoLurkerEnd(e.target.value)}
                className="block rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Durante este horario seras automaticamente Modo Fantasma
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Atras
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Guardando..." : "Empezar a usar HyperHub!"}
        </button>
      </div>
    </div>
  )
}
