// ============================================================
// Phase 4: MessageComposer Component
// apps/web/src/components/chat/MessageComposer.tsx
// ============================================================

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { TONE_TAGS_CHAT, CHAT_CONFIG } from '@hyperhub/shared'
import type { MessagePublic, ToneTagType } from '@hyperhub/shared'

// ============================================================
// ToneTagSelector
// ============================================================

function ToneTagSelector({
  selected,
  onSelect,
  required,
}: {
  selected: ToneTagType | null
  onSelect: (tag: ToneTagType) => void
  required: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedTag = TONE_TAGS_CHAT.find((t) => t.value === selected)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
          selected
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            : required
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse'
              : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
        }`}
        title={required && !selected ? 'Tone tag required!' : 'Select tone tag'}
      >
        {selectedTag ? (
          <>
            <span>{selectedTag.emoji}</span>
            <span>{selectedTag.label}</span>
          </>
        ) : (
          <>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span>Tone{required ? '*' : ''}</span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 z-20 bg-neutral-800 border border-white/10 rounded-xl p-1 shadow-xl min-w-[220px]">
            <p className="text-[10px] text-white/30 px-2 py-1">How does this message feel?</p>
            {TONE_TAGS_CHAT.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => {
                  onSelect(tag.value as ToneTagType)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  selected === tag.value
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <span className="text-sm">{tag.emoji}</span>
                <div>
                  <p className="text-xs font-medium">{tag.label}</p>
                  <p className="text-[10px] text-white/35">{tag.description}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================
// CharacterCounter
// ============================================================

function CharacterCounter({ current, max }: { current: number; max: number }) {
  const pct = current / max
  const color = pct > 0.95 ? 'text-red-400' : pct > 0.8 ? 'text-amber-400' : 'text-white/25'

  if (current < max * 0.7) return null

  return (
    <span className={`text-[10px] tabular-nums ${color}`}>
      {current}/{max}
    </span>
  )
}

// ============================================================
// ReplyPreview
// ============================================================

function ReplyPreview({
  message,
  onCancel,
}: {
  message: MessagePublic
  onCancel: () => void
}) {
  const toneTag = TONE_TAGS_CHAT.find((t) => t.value === message.toneTag)

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border-l-2 border-indigo-500/50 rounded-r-lg mx-3 mb-1">
      <div className="flex-1 min-w-0">
        <span className="text-[10px] text-indigo-400">
          Replying to {message.sender.profile?.displayName ?? message.sender.username}
        </span>
        <p className="text-xs text-white/40 truncate">
          {toneTag?.emoji} {message.content}
        </p>
      </div>
      <button
        onClick={onCancel}
        className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded hover:bg-white/10 text-white/30 hover:text-white/60"
        aria-label="Cancel reply"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ============================================================
// Main MessageComposer
// ============================================================

interface MessageComposerProps {
  conversationId: string
  toneTagRequired: boolean
  replyTo: MessagePublic | null
  onCancelReply: () => void
  onSend: (content: string, toneTag: ToneTagType, replyToId?: string) => Promise<void>
  onTyping: () => void
  isSending: boolean
  error: string | null
}

export default function MessageComposer({
  conversationId,
  toneTagRequired,
  replyTo,
  onCancelReply,
  onSend,
  onTyping,
  isSending,
  error,
}: MessageComposerProps) {
  const [content, setContent] = useState('')
  const [toneTag, setToneTag] = useState<ToneTagType | null>(null)
  const [showError, setShowError] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const maxLength = CHAT_CONFIG.MAX_MESSAGE_LENGTH

  // Focus textarea on conversation change
  useEffect(() => {
    textareaRef.current?.focus()
  }, [conversationId])

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length > maxLength) return
    setContent(val)
    onTyping()
    adjustHeight()
    if (showError) setShowError(false)
  }

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed) return

    // Validate tone tag
    if (toneTagRequired && !toneTag) {
      setShowError(true)
      return
    }

    // Default tone tag if not required and not set
    const finalTag = toneTag ?? 'INFO_DUMP'

    try {
      await onSend(trimmed, finalTag, replyTo?.id)
      setContent('')
      setToneTag(null)
      setShowError(false)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch {
      // Error is passed via props
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = content.trim().length > 0 && (!toneTagRequired || !!toneTag) && !isSending

  return (
    <div className="border-t border-white/5 bg-neutral-900/30">
      {/* Reply preview */}
      {replyTo && <ReplyPreview message={replyTo} onCancel={onCancelReply} />}

      {/* Error message */}
      {(showError || error) && (
        <div className="mx-3 mt-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
          {showError ? 'Please select a tone tag before sending' : error}
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2 px-3 py-2">
        {/* Tone tag selector */}
        <ToneTagSelector
          selected={toneTag}
          onSelect={setToneTag}
          required={toneTagRequired}
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-indigo-500/30 scrollbar-thin"
            style={{ minHeight: '36px', maxHeight: '150px' }}
            disabled={isSending}
          />
        </div>

        {/* Character counter + Send */}
        <div className="flex items-center gap-1.5 pb-0.5">
          <CharacterCounter current={content.length} max={maxLength} />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex items-center justify-center h-9 w-9 rounded-xl transition-all ${
              canSend
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            {isSending ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="flex items-center justify-between px-4 pb-1.5">
        <p className="text-[10px] text-white/15">Enter to send, Shift+Enter for new line</p>
        {toneTagRequired && !toneTag && content.length > 0 && (
          <p className="text-[10px] text-amber-400/50 animate-pulse">Select a tone tag</p>
        )}
      </div>
    </div>
  )
}