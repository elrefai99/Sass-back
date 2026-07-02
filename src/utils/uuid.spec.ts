import { describe, it, expect } from 'vitest'
import { generateUUID } from './uuid'

describe('generateUUID', () => {
  it('returns a 32 character hex string with no dashes', () => {
    const id = generateUUID()
    expect(id).toHaveLength(32)
    expect(id).not.toContain('-')
    expect(id).toMatch(/^[0-9a-f]{32}$/)
  })

  it('returns a unique value on each call', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUUID()))
    expect(ids.size).toBe(100)
  })
})
