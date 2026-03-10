'use client'

import { useState } from 'react'
import { TONE_TAGS } from '@hyperhub/shared'
import type { FeedFilters as FeedFiltersType, ToneTagType } from '@hyperhub/shared'
import { ToneTagBadge } from './ToneTagBadge'

interface FeedFiltersProps {
  filters: FeedFiltersType
  onFiltersChange: (filters: FeedFiltersType) => void
  popularTags?: string[]
}

export function FeedFilters({ filters, onFiltersChange, popularTags = [] }: FeedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const sortOptions: { key: FeedFiltersType['sortBy']; label: string; emoji: string }[] = [
    { key: 'dopamine', label: 'Curacion Dopamina', emoji: '\u{1F9E0}' },
    { key: 'recent', label: 'Mas Recientes', emoji: '\u{1F551}' },
    { key: 'serendipity', label: 'Serendipia', emoji: '\u{1F3B2}' },
  ]

  const handleSortChange = (sortBy: FeedFiltersType['sortBy']) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleToneFilter = (toneTag: ToneTagType | null) => {
    onFiltersChange({
      ...filters,
      toneTag: filters.toneTag === toneTag ? null : toneTag,
    })
  }

  const handleTagFilter = (tag: string | null) => {
    onFiltersChange({
      ...filters,
      tag: filters.tag === tag ? null : tag,
    })
  }

  const hasActiveFilters = filters.toneTag || filters.tag

  return (
    <div className="space-y-3">
      {/* Sort buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
          Ordenar:
        </span>
        <div className="flex gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSortChange(opt.key)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                transition-all duration-200
                ${filters.sortBy === opt.key
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <span>{opt.emoji}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
            transition-all duration-200
            ${hasActiveFilters
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          <span>{isExpanded ? '\u25B2' : '\u25BC'}</span>
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Expandable filter section */}
      {isExpanded && (
        <div className="space-y-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
          {/* Tone filter */}
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider block mb-2">
              Filtrar por tono:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TONE_TAGS) as ToneTagType[]).map((tone) => (
                <ToneTagBadge
                  key={tone}
                  toneTag={tone}
                  size="sm"
                  isSelected={filters.toneTag === tone}
                  onClick={() => handleToneFilter(tone)}
                />
              ))}
              {filters.toneTag && (
                <button
                  onClick={() => handleToneFilter(null)}
                  className="text-xs px-2 py-0.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Tag filter */}
          {popularTags.length > 0 && (
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider block mb-2">
                Tags populares:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`
                      text-xs px-2.5 py-1 rounded-full transition-all duration-200
                      ${filters.tag === tag
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => onFiltersChange({ ...filters, toneTag: null, tag: null })}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}