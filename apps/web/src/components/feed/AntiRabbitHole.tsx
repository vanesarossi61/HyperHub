'use client'

import { useState } from 'react'
import { ANTI_RABBIT_HOLE } from '@hyperhub/shared'

interface AntiRabbitHoleNudgeProps {
  message: string
  minutesElapsed: number
  onDismiss: () => void
  onTakeBreak: () => void
}

export function AntiRabbitHoleNudge({
  message,
  minutesElapsed,
  onDismiss,
  onTakeBreak,
}: AntiRabbitHoleNudgeProps) {
  return (
    <div className="mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5" role="img" aria-label="reloj">
            {'\u23F0'}
          </span>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              {message}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {minutesElapsed} minutos en esta sesion
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onTakeBreak}
                className="text-xs px-3 py-1.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors font-medium"
              >
                Tomar un descanso
              </button>
              <button
                onClick={onDismiss}
                className="text-xs px-3 py-1.5 rounded-full text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              >
                Sigo un rato mas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Break suggestion with activity options
interface BreakSuggestionProps {
  onDismiss: () => void
  onActivitySelected: (activity: string, durationMinutes: number) => void
  onResetSession: () => void
}

export function BreakSuggestion({
  onDismiss,
  onActivitySelected,
  onResetSession,
}: BreakSuggestionProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const handleSelect = (label: string, duration: number) => {
    setSelectedActivity(label)
    onActivitySelected(label, duration)
    // Auto-dismiss after selection
    setTimeout(onDismiss, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="mx-4 max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          <span className="text-4xl block" role="img" aria-label="descanso">
            {'\u{1F9D8}'}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Momento de pausa?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Llevas un buen rato. No hay culpa, solo una sugerencia amistosa.
            Elige una actividad cortita:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {ANTI_RABBIT_HOLE.breakActivities.map((activity) => (
              <button
                key={activity.label}
                onClick={() => handleSelect(activity.label, activity.durationMinutes)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  transition-all duration-200
                  ${selectedActivity === activity.label
                    ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-400'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-xl">{activity.emoji}</span>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    ~{activity.durationMinutes} min
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                onResetSession()
                onDismiss()
              }}
              className="flex-1 text-sm py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors font-medium"
            >
              Ya descanse, resetear timer
            </button>
            <button
              onClick={onDismiss}
              className="text-sm py-2 px-4 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}