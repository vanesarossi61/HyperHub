"use client"

import { useState } from "react"
import { APP_CONFIG } from "@hyperhub/shared"

interface StepHyperfociProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

const SUGGESTED_HYPERFOCI = [
  "Programacion", "Arte Digital", "Musica", "Gaming", "Escritura",
  "Ciencia", "Cocina", "Fotografia", "Plantas", "Astronomia",
  "Anime/Manga", "Historia", "Psicologia", "Idiomas", "Crochet",
  "Minecraft", "Lego", "True Crime", "Mitologia", "Filosofia",
  "Robots", "Acuapon\u00eda", "Origami", "Matematicas", "Moda",
]

export default function StepHyperfoci({ onNext, onBack, onSkip }: StepHyperfociProps) {
  const [activeHyperfoci, setActiveHyperfoci] = useState<string[]>([])
  const [pastHyperfoci, setPastHyperfoci] = useState<string[]>([])
  const [customInput, setCustomInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const toggleActive = (topic: string) => {
    setActiveHyperfoci((prev) => {
      if (prev.includes(topic)) return prev.filter((t) => t !== topic)
      if (prev.length >= APP_CONFIG.maxHyperfoci) return prev
      return [...prev, topic]
    })
  }

  const togglePast = (topic: string) => {
    setPastHyperfoci((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (activeHyperfoci.length < APP_CONFIG.maxHyperfoci && !activeHyperfoci.includes(trimmed)) {
      setActiveHyperfoci((prev) => [...prev, trimmed])
    }
    setCustomInput("")
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentHyperfoci: activeHyperfoci,
          hyperfocusHistory: pastHyperfoci,
        }),
      })
      if (res.ok) onNext()
    } catch (err) {
      console.error("Failed to save hyperfoci:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Tus Hiperfocos</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Que te apasiona AHORA MISMO? Elige hasta {APP_CONFIG.maxHyperfoci} hiperfocos activos.
        </p>
      </div>

      {/* Active counter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Activos: {activeHyperfoci.length}/{APP_CONFIG.maxHyperfoci}
        </span>
        {activeHyperfoci.length >= APP_CONFIG.maxHyperfoci && (
          <span className="text-xs text-amber-500">Maximo alcanzado</span>
        )}
      </div>

      {/* Active hyperfoci display */}
      {activeHyperfoci.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeHyperfoci.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            >
              {h}
              <button
                onClick={() => toggleActive(h)}
                className="ml-0.5 text-brand-500 hover:text-brand-700"
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Agrega tu propio hiperfoco..."
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={addCustom}
          disabled={activeHyperfoci.length >= APP_CONFIG.maxHyperfoci || !customInput.trim()}
          className="rounded-xl bg-[var(--muted)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50 transition-colors"
        >
          Agregar
        </button>
      </div>

      {/* Suggested topics */}
      <div>
        <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          Sugerencias (toca para activar)
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_HYPERFOCI.filter((h) => !activeHyperfoci.includes(h)).map((h) => (
            <button
              key={h}
              onClick={() => toggleActive(h)}
              disabled={activeHyperfoci.length >= APP_CONFIG.maxHyperfoci}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Past hyperfoci */}
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--foreground)]">
          Hiperfocos pasados <span className="font-normal text-[var(--muted-foreground)]">(los que ya "quemaste")</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_HYPERFOCI.filter((h) => !activeHyperfoci.includes(h)).slice(0, 15).map((h) => (
            <button
              key={h}
              onClick={() => togglePast(h)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                pastHyperfoci.includes(h)
                  ? "bg-[var(--muted)] text-[var(--foreground)] line-through opacity-70"
                  : "border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-solid"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Atras
          </button>
          <button
            onClick={onSkip}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
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
