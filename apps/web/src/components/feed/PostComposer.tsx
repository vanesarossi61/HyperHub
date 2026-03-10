'use client'

import { useState, useCallback } from 'react'
import { POST_LIMITS, TONE_TAGS } from '@hyperhub/shared'
import type { ToneTagType, CreatePostRequest } from '@hyperhub/shared'
import { ToneTagSelector } from './ToneTagBadge'

// ============================================================
// PostComposer -- Create a new post with tone tag requirement
// ============================================================

interface PostComposerProps {
  onSubmit: (data: CreatePostRequest) => Promise<any>
  userHyperfoci?: string[]
  isCompact?: boolean
}

export function PostComposer({
  onSubmit,
  userHyperfoci = [],
  isCompact = false,
}: PostComposerProps) {
  const [isOpen, setIsOpen] = useState(!isCompact)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [toneTag, setToneTag] = useState<ToneTagType | null>(null)
  const [hyperfoci, setHyperfoci] = useState<string[]>([])
  const [newHyperfocus, setNewHyperfocus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const isInfoDump = wordCount >= POST_LIMITS.infoDumpThreshold
  const canSubmit = content.trim() && toneTag && !isSubmitting

  const handleAddHyperfocus = useCallback(() => {
    const tag = newHyperfocus.trim().toLowerCase()
    if (tag && !hyperfoci.includes(tag) && hyperfoci.length < POST_LIMITS.maxHyperfociPerPost) {
      setHyperfoci((prev) => [...prev, tag])
      setNewHyperfocus('')
    }
  }, [newHyperfocus, hyperfoci])

  const handleRemoveHyperfocus = useCallback((tag: string) => {
    setHyperfoci((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleSubmit = async () => {
    if (!canSubmit || !toneTag) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        title: title.trim() || undefined,
        content: content.trim(),
        toneTag,
        hyperfoci: hyperfoci.length > 0 ? hyperfoci : undefined,
      })

      // Reset form
      setTitle('')
      setContent('')
      setToneTag(null)
      setHyperfoci([])
      if (isCompact) setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Compact mode: Show just a prompt bar
  if (isCompact && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="
          w-full p-4 rounded-2xl border border-gray-200 bg-white
          text-left text-gray-400 hover:border-gray-300
          hover:shadow-sm transition-all
        "
      >
        Que estas pensando? Compartilo con la comunidad...
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Nuevo Post</h3>
        {isCompact && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Tone Tag Selector (required!) */}
        <ToneTagSelector
          selected={toneTag}
          onSelect={setToneTag}
          required
        />

        {/* Title (optional) */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo (opcional)"
            maxLength={POST_LIMITS.maxTitleLength}
            className="
              w-full px-3 py-2 rounded-lg border border-gray-200
              text-sm placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
            "
          />
          {title.length > POST_LIMITS.maxTitleLength * 0.8 && (
            <p className="text-xs text-gray-400 mt-1 text-right">
              {title.length}/{POST_LIMITS.maxTitleLength}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              toneTag
                ? `${TONE_TAGS[toneTag]?.emoji} ${TONE_TAGS[toneTag]?.description}...`
                : 'Escribi tu post... (primero elegi la etiqueta de tono arriba)'
            }
            maxLength={POST_LIMITS.maxContentLength}
            rows={6}
            className="
              w-full px-3 py-2 rounded-lg border border-gray-200
              text-sm placeholder-gray-400 resize-y min-h-[120px]
              focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
            "
          />

          {/* Word count & info dump detector */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              {isInfoDump && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span aria-hidden="true">\u{1F4DA}</span>
                  Info Dump detectado! Los lectores podran usar TL;DR
                </span>
              )}
            </div>
            <span className={`text-xs ${
              wordCount > POST_LIMITS.infoDumpThreshold * 0.8
                ? 'text-amber-500'
                : 'text-gray-400'
            }`}>
              {wordCount} palabras
            </span>
          </div>
        </div>

        {/* Hyperfoci tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hiperfocos relacionados
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {hyperfoci.map((tag) => (
              <span
                key={tag}
                className="
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                  text-xs bg-indigo-50 text-indigo-700 border border-indigo-100
                "
              >
                # {tag}
                <button
                  onClick={() => handleRemoveHyperfocus(tag)}
                  className="text-indigo-400 hover:text-indigo-600 ml-0.5"
                  aria-label={`Quitar ${tag}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>

          {hyperfoci.length < POST_LIMITS.maxHyperfociPerPost && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newHyperfocus}
                onChange={(e) => setNewHyperfocus(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHyperfocus())}
                placeholder="Agregar hiperfoco..."
                className="
                  flex-1 px-3 py-1.5 rounded-lg border border-gray-200
                  text-xs placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-200
                "
              />
              <button
                onClick={handleAddHyperfocus}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100"
              >
                + Agregar
              </button>
            </div>
          )}

          {/* Quick add from user's hyperfoci */}
          {userHyperfoci.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Tus hiperfocos:</p>
              <div className="flex flex-wrap gap-1">
                {userHyperfoci
                  .filter((hf) => !hyperfoci.includes(hf.toLowerCase()))
                  .map((hf) => (
                    <button
                      key={hf}
                      onClick={() => {
                        if (hyperfoci.length < POST_LIMITS.maxHyperfociPerPost) {
                          setHyperfoci((prev) => [...prev, hf.toLowerCase()])
                        }
                      }}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      + {hf}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            {toneTag
              ? `Tono: ${TONE_TAGS[toneTag]?.emoji} ${TONE_TAGS[toneTag]?.label}`
              : 'Falta elegir tono'}
          </p>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              px-6 py-2 rounded-xl text-sm font-medium
              transition-all
              ${canSubmit
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
