'use client'

import { useState } from 'react'
import { TONE_TAGS, FEED_SORT_OPTIONS } from '@hyperhub/shared'
import type { FeedFilters as FeedFiltersType, FeedSortOption, ToneTagType } from '@hyperhub/shared'

// ============================================================
// FeedFilters -- Sidebar filter panel for the feed
// ============================================================

interface FeedFiltersProps {
  filters: FeedFiltersType
  sort: FeedSortOption
  onFiltersChange: (filters: FeedFiltersType) => void
  onSortChange: (sort: FeedSortOption) => void
  userHyperfoci?: string[]
  isCollapsed?: boolean
}

export function FeedFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  userHyperfoci = [],
  isCollapsed: initialCollapsed = false,
}: FeedFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const allToneTags = Object.values(TONE_TAGS)
  const hasActiveFilters = !!(filters.toneTag || filters.hyperfocus || filters.search || filters.isInfoDump)

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchInput.trim() || undefined })
  }

  const handleClearAll = () => {
    onFiltersChange({})
    setSearchInput('')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Filtros</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </div>
        <span className="text-gray-400 text-xs">
          {isCollapsed ? 'Mostrar' : 'Ocultar'}
        </span>
      </button>

      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-5">
          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Ordenar por
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {FEED_SORT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onSortChange(option.key)}
                  className={`
                    group relative px-3 py-2 rounded-lg text-xs font-medium
                    transition-all text-left
                    ${sort === option.key
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {option.label}
                  {/* Tooltip */}
                  <span
                    className="
                      absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                      px-2 py-1 rounded text-[10px] text-white bg-gray-800
                      opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none whitespace-nowrap z-10
                    "
                  >
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Buscar
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Buscar en posts..."
                className="
                  flex-1 px-3 py-1.5 rounded-lg border border-gray-200
                  text-xs placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                "
              />
              <button
                onClick={handleSearchSubmit}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs hover:bg-gray-200"
              >
                Ir
              </button>
            </div>
          </div>

          {/* Tone Tag filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Tono
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onFiltersChange({ ...filters, toneTag: undefined })}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium transition-all
                  ${!filters.toneTag
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
              >
                Todos
              </button>
              {allToneTags.map((tag) => (
                <button
                  key={tag.key}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      toneTag: filters.toneTag === tag.key ? undefined : (tag.key as ToneTagType),
                    })
                  }
                  className={`
                    px-2.5 py-1 rounded-full text-xs font-medium transition-all
                    ${filters.toneTag === tag.key
                      ? 'ring-1 ring-offset-1 shadow-sm'
                      : 'opacity-60 hover:opacity-100'
                    }
                  `}
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    ringColor: filters.toneTag === tag.key ? tag.color : undefined,
                  }}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hyperfocus filter */}
          {userHyperfoci.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Hiperfoco
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onFiltersChange({ ...filters, hyperfocus: undefined })}
                  className={`
                    px-2.5 py-1 rounded-full text-xs font-medium transition-all
                    ${!filters.hyperfocus
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }
                  `}
                >
                  Todos
                </button>
                {userHyperfoci.map((hf) => (
                  <button
                    key={hf}
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        hyperfocus: filters.hyperfocus === hf ? undefined : hf,
                      })
                    }
                    className={`
                      px-2.5 py-1 rounded-full text-xs font-medium transition-all
                      ${filters.hyperfocus === hf
                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
                        : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'
                      }
                    `}
                  >
                    # {hf}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Dump toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Solo Info Dumps</span>
            <button
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  isInfoDump: filters.isInfoDump ? undefined : true,
                })
              }
              className={`
                relative w-10 h-5 rounded-full transition-colors
                ${filters.isInfoDump ? 'bg-green-500' : 'bg-gray-300'}
              `}
              role="switch"
              aria-checked={!!filters.isInfoDump}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
                  shadow transition-transform
                  ${filters.isInfoDump ? 'translate-x-5' : ''}
                `}
              />
            </button>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="w-full text-center text-xs text-red-500 hover:text-red-600 py-1"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
