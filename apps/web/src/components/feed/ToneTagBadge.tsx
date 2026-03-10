'use client'

import { TONE_TAGS } from '@hyperhub/shared'
import type { ToneTagType } from '@hyperhub/shared'

// ============================================================
// ToneTagBadge -- Visual badge for post tone tags
// ============================================================

interface ToneTagBadgeProps {
  toneTag: ToneTagType
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  interactive?: boolean
  onClick?: () => void
}

export function ToneTagBadge({
  toneTag,
  size = 'md',
  showDescription = false,
  interactive = false,
  onClick,
}: ToneTagBadgeProps) {
  const tag = TONE_TAGS[toneTag]

  if (!tag) return null

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        transition-all duration-150
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''}
      `}
      style={{
        backgroundColor: `${tag.color}15`,
        color: tag.color,
        border: `1px solid ${tag.color}30`,
      }}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={tag.description}
    >
      <span className="leading-none" aria-hidden="true">
        {tag.emoji}
      </span>
      <span>{tag.label}</span>
      {showDescription && (
        <span className="opacity-70 text-xs ml-1">-- {tag.description}</span>
      )}
    </span>
  )
}

// ============================================================
// ToneTagSelector -- For use in PostComposer
// ============================================================

interface ToneTagSelectorProps {
  selected: ToneTagType | null
  onSelect: (tag: ToneTagType) => void
  required?: boolean
}

export function ToneTagSelector({ selected, onSelect, required = true }: ToneTagSelectorProps) {
  const allTags = Object.values(TONE_TAGS)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Etiqueta de Intencion {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500">
        Ayuda a los demas a entender tu tono. Previene malentendidos y ansiedad por RSD.
      </p>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag.key}
            type="button"
            onClick={() => onSelect(tag.key as ToneTagType)}
            className={`
              group relative inline-flex items-center gap-1.5 rounded-full
              px-3 py-1.5 text-sm font-medium transition-all duration-150
              ${selected === tag.key
                ? 'ring-2 ring-offset-2 shadow-md scale-105'
                : 'hover:scale-102 hover:shadow-sm opacity-70 hover:opacity-100'
              }
            `}
            style={{
              backgroundColor: selected === tag.key ? `${tag.color}25` : `${tag.color}10`,
              color: tag.color,
              borderColor: tag.color,
              ringColor: tag.color,
            }}
          >
            <span aria-hidden="true">{tag.emoji}</span>
            <span>{tag.label}</span>

            {/* Tooltip on hover */}
            <span
              className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                px-2 py-1 rounded text-xs text-white bg-gray-800
                opacity-0 group-hover:opacity-100 transition-opacity
                pointer-events-none whitespace-nowrap z-10
              "
            >
              {tag.description}
            </span>
          </button>
        ))}
      </div>
      {required && !selected && (
        <p className="text-xs text-amber-600">
          Elegir un tono es parte de la comunicacion segura en HyperHub
        </p>
      )}
    </div>
  )
}
