'use client'

import { useMemo } from 'react'
import { toBionicText } from '@/lib/bionicReading'
import type { BionicWord } from '@/lib/bionicReading'

interface BionicTextProps {
  text: string
  enabled?: boolean
  className?: string
}

/**
 * BionicText - Renders text with bionic reading formatting
 * 
 * Bolds the first portion of each word to create fixation points
 * that help neurodivergent readers process text more efficiently.
 * 
 * Gracefully falls back to normal text when disabled.
 */
export function BionicText({ text, enabled = true, className = '' }: BionicTextProps) {
  const bionicWords = useMemo(() => {
    if (!enabled) return null
    return toBionicText(text)
  }, [text, enabled])

  if (!enabled || !bionicWords) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {bionicWords.map((word: BionicWord, index: number) => {
        if (!word.bold && !word.normal) return null
        if (!word.bold) return <span key={index}>{word.normal}</span>

        return (
          <span key={index}>
            <strong className="font-bold">{word.bold}</strong>
            {word.normal}
          </span>
        )
      })}
    </span>
  )
}

// Paragraph variant that handles multi-line text
interface BionicParagraphProps {
  text: string
  enabled?: boolean
  className?: string
}

export function BionicParagraph({ text, enabled = true, className = '' }: BionicParagraphProps) {
  const paragraphs = text.split('\n\n')

  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((para, i) => {
        const lines = para.split('\n')
        return (
          <p key={i} className="leading-relaxed">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <BionicText text={line} enabled={enabled} />
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}