'use client'

import { useState, useCallback, useRef } from 'react'
import type { ToneTagType, VisibilityType, CreatePostRequest } from '@hyperhub/shared'
import { FEED_CONFIG, VISIBILITY_OPTIONS, READING_CONFIG } from '@hyperhub/shared'
import { ToneTagSelector } from './ToneTagBadge'

interface PostComposerProps {
  onSubmit: (post: CreatePostRequest) => Promise<void>
  isSubmitting?: boolean
}

export function PostComposer({ onSubmit, isSubmitting = false }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [toneTag, setToneTag] = useState<ToneTagType | null>(null)
  const [visibility, setVisibility] = useState<VisibilityType>('PUBLIC')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readingTime = Math.ceil((wordCount / READING_CONFIG.averageWPM) * 60)
  const isLongPost = wordCount >= READING_CONFIG.longPostThreshold
  const charsRemaining = FEED_CONFIG.maxPostLength - content.length

  const handleAddTag = useCallback(() => {
    const normalized = tagInput.toLowerCase().trim().replace(/^#/, '')
    if (normalized && !tags.includes(normalized) && tags.length < FEED_CONFIG.maxTagsPerPost) {
      setTags([...tags, normalized])
      setTagInput('')
    }
  }, [tagInput, tags])

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async () => {
    setError(null)

    if (!content.trim()) {
      setError('Escribe algo antes de publicar')
      return
    }
    if (!toneTag) {
      setError('Elige como te sientes con este post (etiqueta de tono)')
      return
    }

    try {
      await onSubmit({
        content: content.trim(),
        toneTag,
        visibility,
        isAnonymous,
        tags: tags.length > 0 ? tags : undefined,
      })

      // Reset form
      setContent('')
      setToneTag(null)
      setTags([])
      setTagInput('')
      setIsAnonymous(false)
      setVisibility('PUBLIC')
      setIsExpanded(false)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error al publicar')
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Textarea */}
      <div className="p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Que tienes en mente? Comparte un hiperfoco, desahogate, o pregunta algo..."
          className="w-full min-h-[80px] resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm leading-relaxed"
          maxLength={FEED_CONFIG.maxPostLength}
          rows={isExpanded ? 4 : 2}
        />

        {/* Word count & reading time */}
        {content.length > 0 && (
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{wordCount} palabras</span>
            {wordCount > 0 && <span>~{readingTime}s lectura</span>}
            {isLongPost && (
              <span className="text-amber-500">
                Post largo - se generara TL;DR
              </span>
            )}
            <span className={charsRemaining < 500 ? 'text-red-400' : ''}>
              {charsRemaining} caracteres restantes
            </span>
          </div>
        )}
      </div>

      {/* Expanded options */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Tone Tag - OBLIGATORIO */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 block">
              Como te sientes con este post? *
            </label>
            <ToneTagSelector
              selected={toneTag}
              onSelect={setToneTag}
              size="sm"
            />
            {!toneTag && content.length > 0 && (
              <p className="text-xs text-amber-500 mt-1">
                Elegir un tono ayuda a que otros sepan como leer tu post
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2 block">
              Tags (max {FEED_CONFIG.maxTagsPerPost})
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            {tags.length < FEED_CONFIG.maxTagsPerPost && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddTag}
                placeholder="Agrega un tag y presiona Enter..."
                className="w-full text-sm px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            )}
          </div>

          {/* Bottom row: visibility, anonymous, submit */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Visibility */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as VisibilityType)}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {(Object.keys(VISIBILITY_OPTIONS) as VisibilityType[]).map((key) => (
                <option key={key} value={key}>
                  {VISIBILITY_OPTIONS[key].emoji} {VISIBILITY_OPTIONS[key].label}
                </option>
              ))}
            </select>

            {/* Anonymous toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {'\u{1F47B}'} Anonimo
              </span>
            </label>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="ml-auto px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 animate-in fade-in duration-200">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}