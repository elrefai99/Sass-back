import { randomInt } from 'crypto'

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghijkmnpqrstuvwxyz'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%&*?'
const ALL = UPPER + LOWER + DIGITS + SYMBOLS

/**
 * Generates a cryptographically-random temporary password that always
 * contains at least one uppercase, lowercase, digit and symbol.
 */
export function generateTemporaryPassword(length = 12): string {
  const required = [
    UPPER[randomInt(UPPER.length)],
    LOWER[randomInt(LOWER.length)],
    DIGITS[randomInt(DIGITS.length)],
    SYMBOLS[randomInt(SYMBOLS.length)],
  ]

  const rest = Array.from({ length: Math.max(length, required.length) - required.length }, () => ALL[randomInt(ALL.length)])

  const chars = [...required, ...rest]

  // Fisher-Yates shuffle so the required characters are not always in front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
