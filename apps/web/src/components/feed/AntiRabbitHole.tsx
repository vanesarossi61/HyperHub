'use client'

import { useAntiRabbitHole } from '@/hooks/useAntiRabbitHole'

// ============================================================
// AntiRabbitHole -- Gentle time-awareness nudge component
// "Llevas un rato aca. Tomaste agua?"
// ============================================================

interface AntiRabbitHoleProps {
  enabled?: boolean
}

export function AntiRabbitHole({ enabled = true }: AntiRabbitHoleProps) {
  const {
    nudgeLevel,
    minutesActive,
    currentMessage,
    isDismissed,
    dismiss,
    resetTimer,
  } = useAntiRabbitHole({ enabled })

  // Don't render if no nudge or dismissed
  if (nudgeLevel === 'none' || isDismissed || !currentMessage) {
    return null
  }

  const levelStyles = {
    soft: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: '\u{1F4A7}', // droplet
      accent: 'text-blue-600',
    },
    medium: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: '\u{23F0}', // alarm clock
      accent: 'text-amber-600',
    },
    strong: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      icon: '\u{1F6D1}', // stop sign
      accent: 'text-rose-600',
    },
  }

  const style = levelStyles[nudgeLevel] || levelStyles.soft

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        max-w-md w-full mx-4
        ${style.bg} border rounded-2xl shadow-lg
        p-4 animate-slide-up
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {style.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.text}`}>
            {currentMessage}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Llevas {minutesActive} minutos en el feed
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={dismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar notificacion"
          >
            Entendido
          </button>
          <button
            onClick={resetTimer}
            className={`text-xs ${style.accent} hover:underline transition-colors`}
          >
            Ya volvi!
          </button>
        </div>
      </div>

      {/* Progress bar for strong nudge */}
      {nudgeLevel === 'strong' && (
        <div className="mt-3 pt-2 border-t border-rose-200">
          <p className="text-xs text-rose-600 text-center">
            Sugerencia: Cierra la app 10 minutos. Tu yo del futuro te lo va a agradecer.
          </p>
        </div>
      )}
    </div>
  )
}
