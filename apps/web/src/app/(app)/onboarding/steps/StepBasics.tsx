"use client"

import { useState } from "react"
import { NEURODIV_TYPES, PRONOUNS_OPTIONS, AGE_RANGES, APP_CONFIG } from "@hyperhub/shared"
import type { NeurodivTypeValue } from "@hyperhub/shared"

interface StepBasicsProps {
  onNext: () => void
  onSkip: () => void
}

export default function StepBasics({ onNext, onSkip }: StepBasicsProps) {
  const [username, setUsername] = useState("")
  const [pronouns, setPronouns] = useState("")
  const [customPronouns, setCustomPronouns] = useState("")
  const [ageRange, setAgeRange] = useState("")
  const [neurodivTypes, setNeurodivTypes] = useState<NeurodivTypeValue[]>([])
  const [selfDiagnosed, setSelfDiagnosed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const toggleNeurodiv = (type: NeurodivTypeValue) => {
    setNeurodivTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: username || undefined,
          pronouns: pronouns === "custom" ? customPronouns : pronouns || undefined,
          ageRange: ageRange || undefined,
          neurodivTypes,
          selfDiagnosed,
        }),
      })
      if (res.ok) {
        onNext()
      }
    } catch (err) {
      console.error("Failed to save basics:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Lo Basico</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Como quieres que te conozcan? Todo es opcional.
        </p>
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Nombre visible
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Como quieres que te llamen?"
          maxLength={APP_CONFIG.maxDisplayNameLength}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Pronouns */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Pronombres
        </label>
        <div className="flex flex-wrap gap-2">
          {PRONOUNS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPronouns(opt.key)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                pronouns === opt.key
                  ? "bg-brand-600 text-white"
                  : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {pronouns === "custom" && (
          <input
            type="text"
            value={customPronouns}
            onChange={(e) => setCustomPronouns(e.target.value)}
            placeholder="Tus pronombres"
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none"
          />
        )}
      </div>

      {/* Age Range */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Rango de edad
        </label>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setAgeRange(opt.key)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                ageRange === opt.key
                  ? "bg-brand-600 text-white"
                  : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Neurodiv Types */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
          Me identifico como... <span className="font-normal text-[var(--muted-foreground)]">(sin juicio, elige lo que sientas)</span>
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.entries(NEURODIV_TYPES) as [NeurodivTypeValue, { label: string; description: string }][]).map(
            ([key, val]) => (
              <button
                key={key}
                onClick={() => toggleNeurodiv(key)}
                title={val.description}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  neurodivTypes.includes(key)
                    ? "bg-brand-600 text-white"
                    : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {val.label}
              </button>
            )
          )}
        </div>

        {/* Self-diagnosed toggle */}
        {neurodivTypes.length > 0 && neurodivTypes[0] !== "PREFER_NOT_TO_SAY" && (
          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
            <input
              type="checkbox"
              checked={selfDiagnosed}
              onChange={(e) => setSelfDiagnosed(e.target.checked)}
              className="rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
            />
            Autodiagnosticado/a (igual de valido!)
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onSkip}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Saltar todo
        </button>
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
