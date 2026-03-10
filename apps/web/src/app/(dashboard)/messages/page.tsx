// ============================================================
// Phase 4: Messages Page (Split-View Layout)
// apps/web/src/app/(dashboard)/messages/page.tsx
// ============================================================

'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import ConversationList from '~/components/chat/ConversationList'
import ChatWindow from '~/components/chat/ChatWindow'
import { useConversations } from '~/hooks/useChat'
import type { ConversationTypeValue, ToneTagType } from '@hyperhub/shared'

// ============================================================
// NewConversationModal
// ============================================================

function NewConversationModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: { type: ConversationTypeValue; participantIds: string[]; name?: string; description?: string }) => Promise<any>
  isCreating: boolean
}) {
  const [type, setType] = useState<ConversationTypeValue>('DIRECT')
  const [participantInput, setParticipantInput] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCreate = async () => {
    setError(null)
    const participantIds = participantInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (participantIds.length === 0) {
      setError('Add at least one participant')
      return
    }

    if (type !== 'DIRECT' && !name.trim()) {
      setError('Group and Safe Space conversations need a name')
      return
    }

    try {
      await onCreate({
        type,
        participantIds,
        name: type !== 'DIRECT' ? name : undefined,
        description: description || undefined,
      })
      // Reset & close
      setType('DIRECT')
      setParticipantInput('')
      setName('')
      setDescription('')
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create conversation')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-base font-semibold text-white/90">New Conversation</h3>
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Type selector */}
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Type</label>
              <div className="flex gap-2">
                {(['DIRECT', 'GROUP', 'SAFE_SPACE'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      type === t
                        ? t === 'SAFE_SPACE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/8'
                    }`}
                  >
                    {t === 'DIRECT' ? 'Direct' : t === 'GROUP' ? 'Group' : 'Safe Space'}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Participants (user IDs, comma separated)</label>
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                placeholder="user-id-1, user-id-2"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30"
              />
            </div>

            {/* Name (for groups) */}
            {type !== 'DIRECT' && (
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Name*</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Conversation name"
                  maxLength={100}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30"
                />
              </div>
            )}

            {/* Description (optional) */}
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this conversation about?"
                maxLength={500}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30 resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-white/5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/50 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================
// Main Messages Page
// ============================================================

export default function MessagesPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id ?? ''

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const { createConversation, isCreating } = useConversations()

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id)
    setMobileShowChat(true) // On mobile, switch to chat view
  }, [])

  const handleBack = useCallback(() => {
    setMobileShowChat(false)
  }, [])

  const handleCreateConversation = async (data: {
    type: ConversationTypeValue
    participantIds: string[]
    name?: string
    description?: string
  }) => {
    const conv = await createConversation(data)
    setActiveConversationId(conv.id)
    setMobileShowChat(true)
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-white/30">Please sign in to access messages</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-neutral-950">
      {/* Conversation List (left panel) */}
      <div
        className={`w-full lg:w-[360px] lg:min-w-[320px] lg:max-w-[400px] flex-shrink-0 ${
          mobileShowChat ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
        }`}
      >
        <ConversationList
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setShowNewConversation(true)}
        />
      </div>

      {/* Chat Window (right panel) */}
      <div
        className={`flex-1 ${
          !mobileShowChat ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
        }`}
      >
        <ChatWindow
          conversationId={activeConversationId}
          currentUserId={currentUserId}
          onBack={handleBack}
        />
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onCreate={handleCreateConversation}
        isCreating={isCreating}
      />
    </div>
  )
}