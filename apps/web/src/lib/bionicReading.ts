import { READING_CONFIG } from '@hyperhub/shared'

/**
 * Bionic Reading - Bold the first portion of each word
 * 
 * Research suggests that bolding the initial letters of words
 * creates "fixation points" that help neurodivergent readers
 * process text more efficiently. The eye anchors on the bold
 * part and the brain fills in the rest.
 * 
 * This is configurable and never forced on anyone.
 */

export interface BionicWord {
  bold: string   // First portion to bold
  normal: string // Rest of the word
}

/**
 * Split a word into bionic reading parts.
 * Short words (1-3 chars): bold entire word
 * Medium words (4-7 chars): bold first 40%
 * Long words (8+ chars): bold first 40% rounded up
 */
export function toBionicWord(word: string): BionicWord {
  if (!word || word.length === 0) {
    return { bold: '', normal: '' }
  }

  // Don't process punctuation-only tokens
  if (/^[^\w]+$/.test(word)) {
    return { bold: '', normal: word }
  }

  // Strip leading/trailing punctuation for processing
  const leadPunct = word.match(/^([^\w]*)/)?.[1] || ''
  const trailPunct = word.match(/([^\w]*)$/)?.[1] || ''
  const core = word.slice(leadPunct.length, word.length - (trailPunct.length || undefined))

  if (core.length <= 1) {
    return { bold: word, normal: '' }
  }

  if (core.length <= 3) {
    return { bold: leadPunct + core, normal: trailPunct }
  }

  const boldLength = Math.ceil(core.length * READING_CONFIG.bionicBoldRatio)
  const boldPart = core.slice(0, boldLength)
  const normalPart = core.slice(boldLength)

  return {
    bold: leadPunct + boldPart,
    normal: normalPart + trailPunct,
  }
}

/**
 * Process a full text block into bionic reading segments.
 * Preserves whitespace, newlines, and markdown formatting.
 */
export function toBionicText(text: string): BionicWord[] {
  if (!text) return []

  // Split by whitespace but preserve the whitespace as separators
  const tokens = text.split(/(\s+)/)
  
  return tokens.map((token) => {
    // Whitespace tokens pass through as-is
    if (/^\s+$/.test(token)) {
      return { bold: '', normal: token }
    }
    return toBionicWord(token)
  })
}

/**
 * Convert text to HTML with bionic reading formatting.
 * Returns HTML string with <strong> tags for bold parts.
 */
export function toBionicHTML(text: string): string {
  const words = toBionicText(text)
  return words
    .map(({ bold, normal }) => {
      if (!bold && !normal) return ''
      if (!bold) return escapeHtml(normal)
      if (!normal) return `<strong>${escapeHtml(bold)}</strong>`
      return `<strong>${escapeHtml(bold)}</strong>${escapeHtml(normal)}`
    })
    .join('')
}

/**
 * Calculate estimated reading time for text
 */
export function calculateReadingTime(text: string, wpm: number = READING_CONFIG.averageWPM): {
  seconds: number
  wordCount: number
  isLongPost: boolean
} {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const seconds = Math.ceil((wordCount / wpm) * 60)
  const isLongPost = wordCount >= READING_CONFIG.longPostThreshold

  return { seconds, wordCount, isLongPost }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}