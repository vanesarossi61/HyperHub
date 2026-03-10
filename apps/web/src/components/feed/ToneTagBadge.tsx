'use client'

import { TONE_TAGS } from '@hyperhub/shared'
import type { ToneTagType } from '@hyperhub/shared'

interface ToneTagBadgeProps {
  toneTag: ToneTagType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  onClick?: () => void
  isSelected?: boolean
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
}

export function ToneTagBadge({
  toneTag,
  size = 'md',
  showLabel = true,
  onClick,
  isSelected = false,
}: ToneTagBadgeProps) {
  const tag = TONE_TAGS[toneTag]
  if (!tag) return null

  const Component = onClick ? 'button' : 'span'

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center rounded-full font-medium
        transition-all duration-200
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${isSelected
          ? 'ring-2 ring-offset-2 ring-offset-background'
          : 'ring-0'
        }
      `}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        borderColor: isSelected ? tag.color : 'transparent',
        borderWidth: '1px',
        ...(isSelected && { ringColor: tag.color }),
      }}
      title={tag.description}
    >
      <span className="flex-shrink-0">{tag.emoji}</span>
      {showLabel && <span>{tag.label}</span>}
    </Component>
  )
}

// Grid of all tone tags for selection
interface ToneTagSelectorProps {
  selected: ToneTagType | null
  onSelect: (tone: ToneTagType) => void
  size?: 'sm' | 'md' | 'lg'
}

export function ToneTagSelector({ selected, onSelect, size = 'md' }: ToneTagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(TONE_TAGS) as ToneTagType[]).map((key) => (
        <ToneTagBadge
          key={key}
          toneTag={key}
          size={size}
          isSelected={selected === key}
          onClick={() => onSelect(key)}
        />
      ))}
    </div>
  )
}