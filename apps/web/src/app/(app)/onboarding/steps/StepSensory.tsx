"use client"

import { useState } from "react"
import { SENSORY_PRESETS, COLOR_PALETTES, ANIMATION_LEVELS, DENSITY_LEVELS, SENSORY_DEFAULTS } from "@hyperhub/shared"
import type { SensoryPreferencesConfig, ContrastModeType, AnimationToleranceType, InfoDensityType } from "@hyperhub/shared"

interface StepSensoryProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function StepSensory({ onNext, onBack, onSkip }: StepSensoryProps) {
  const [config, setConfig] = useState<SensoryPreferencesConfig>({
    ...SENSORY_DEFAULTS,
    activePreset: null,
  })
  const [showCustom, setShowCustom] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const applyPreset = (presetKey: string) => {
    const preset = SENSORY_PRESETS.find((p) => p.key === presetKey)
    if (preset) {
      setConfig((prev) => ({ ...prev, ...preset.config, activePreset: presetKey }))
      setShowCustom(false)
    }
  }

  const updateConfig = (updates: Partial<SensoryPreferencesConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates, activePreset: null }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/sensory-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (res.ok) onNext()
    } catch (err) {
      console.error("Failed to save sensory preferences:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Perfil Sensorial</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Personaliza como se ve y se siente HyperHub. Elige un preset o ajusta manualmente.
        </p>
      </div>

      {/* Presets */}
      <div>
        <p className="mb-3 text-sm font-medium text-[var(--foreground)]">
          Presets rapidos
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SENSORY_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset.key)}
              className={`rounded-xl border p-4 text-left transition-all ${
                config.activePreset === preset.key
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                  : "border-[var(--border)] hover:border-brand-300"
              }`}
            >
              <p className="text-sm font-medium text-[var(--foreground)]">{preset.label}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom toggle */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
      >
        {showCustom ? "Ocultar ajustes manuales" : "Ajustar manualmente"}
      </button>

      {/* Custom settings */}
      {showCustom && (
        <div className="space-y-5 rounded-xl border border-[var(--border)] p-4">
          {/* Color Palette */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Paleta de colores</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTES.map((p) => (
                <button
                  key={p.key}
                  onClick={() => updateConfig({ colorPalette: p.key as ContrastModeType })}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    config.colorPalette === p.key
                      ? "bg-brand-600 text-white"
                      : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animations */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Animaciones</label>
            <div className="flex flex-wrap gap-2">
              {ANIMATION_LEVELS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => updateConfig({ animationTolerance: a.key as AnimationToleranceType })}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    config.animationTolerance === a.key
                      ? "bg-brand-600 text-white"
                      : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Densidad de info</label>
            <div className="flex flex-wrap gap-2">
              {DENSITY_LEVELS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => updateConfig({ informationDensity: d.key as InfoDensityType })}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    config.informationDensity === d.key
                      ? "bg-brand-600 text-white"
                      : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Tamano de texto: {Math.round(config.fontScale * 100)}%
            </label>
            <input
              type="range"
              min={0.8}
              max={1.5}
              step={0.1}
              value={config.fontScale}
              onChange={(e) => updateConfig({ fontScale: parseFloat(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bionicReadingEnabled}
                onChange={(e) => updateConfig({ bionicReadingEnabled: e.target.checked })}
                className="rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="text-sm text-[var(--foreground)]">Lectura Bionica</p>
                <p className="text-xs text-[var(--muted-foreground)]">Resalta primeras silabas para leer mas rapido</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.dyslexicFontEnabled}
                onChange={(e) => updateConfig({ dyslexicFontEnabled: e.target.checked })}
                className="rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="text-sm text-[var(--foreground)]">Fuente para dislexia</p>
                <p className="text-xs text-[var(--muted-foreground)]">Tipografia disenada para facilitar la lectura</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.reducedMotion}
                onChange={(e) => updateConfig({ reducedMotion: e.target.checked })}
                className="rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="text-sm text-[var(--foreground)]">Reducir movimiento</p>
                <p className="text-xs text-[var(--muted-foreground)]">Minimiza animaciones y transiciones</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Preview box */}
      <div
        className="rounded-xl border border-dashed border-[var(--border)] p-4"
        style={{ fontSize: `${config.fontScale}rem` }}
      >
        <p className="text-xs text-[var(--muted-foreground)] mb-2">Preview:</p>
        <p className="text-[var(--foreground)]">
          {config.bionicReadingEnabled ? (
            <>
              <strong>As</strong>i <strong>se</strong> <strong>ve</strong> <strong>tu</strong>{" "}
              <strong>con</strong>tenido <strong>con</strong> <strong>lec</strong>tura{" "}
              <strong>bio</strong>nica <strong>act</strong>ivada.
            </>
          ) : (
            "Asi se ve tu contenido con la configuracion actual."
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <div className="flex gap-3">
          <button onClick={onBack} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Atras
          </button>
          <button onClick={onSkip} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Saltar todo
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Guardando..." : "Siguiente"}
        </button>
      </div>
    </div>
  )
}
