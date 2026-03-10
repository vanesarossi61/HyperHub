'use client'

import { useMemo } from 'react'
import { READING_CONFIG } from '@hyperhub/shared'

// ============================================================
// BionicText -- Bionic reading: bold first part of each word
// Helps neurodivergent readers maintain focus and speed
// ============================================================

interface BionicTextProps {
  text: string
  enabled?: boolean
  className?: string
  boldRatio?: number
  minWordLength?: number
}

export function BionicText({
  text,
  enabled = true,
  className = '',
  boldRatio = READING_CONFIG.bionicBoldRatio,
  minWordLength = READING_CONFIG.bionicMinWordLength,
}: BionicTextProps) {
  const renderedContent = useMemo(() => {
    if (!enabled) return text

    // Split text preserving whitespace and newlines
    const parts = text.split(/(\s+)/)

    return parts.map((part, index) => {
      // If it's whitespace, return as-is
      if (/^\s+$/.test(part)) {
        // Convert newlines to <br/>
        if (part.includes('\n')) {
          const segments = part.split('\n')
          return segments.map((seg, i) => (
            <span key={`${index}-${i}`}>
              {seg}
              {i < segments.length - 1 && <br />}
            </span>
          ))
        }
        return <span key={index}>{part}</span>
      }

      // Short words: don't apply bionic
      if (part.length < minWordLength) {
        return <span key={index}>{part}</span>
      }

      // Calculate bold portion
      const boldLength = Math.ceil(part.length * boldRatio)
      const boldPart = part.slice(0, boldLength)
      const normalPart = part.slice(boldLength)

      return (
        <span key={index}>
          <strong className="font-semibold">{boldPart}</strong>
          <span className="font-normal">{normalPart}</span>
        </span>
      )
    })
  }, [text, enabled, boldRatio, minWordLength])

  return (
    <span className={`bionic-text ${className}`}>
      {renderedContent}
    </span>
  )
}
