import { describe, it, expect } from 'vitest'
import type { Request } from 'express'
import {
  capSerializedSize,
  headerString,
  resolveDeviceType,
  resolveGeo,
  resolveRoute,
  sanitizeBody,
  shouldIgnoreRequest,
} from './parse-request'

const fakeRequest = (overrides: Record<string, unknown>): Request => overrides as unknown as Request

describe('sanitizeBody', () => {
  it('redacts sensitive keys regardless of nesting', () => {
    const result = sanitizeBody({
      email: 'a@b.com',
      password: 'super-secret',
      auth: { token: 'abc123', authorization: 'Bearer xyz' },
    }) as Record<string, unknown>

    expect(result.email).toBe('a@b.com')
    expect(result.password).toBe('[REDACTED]')
    expect((result.auth as Record<string, unknown>).token).toBe('[REDACTED]')
    expect((result.auth as Record<string, unknown>).authorization).toBe('[REDACTED]')
  })

  it('does not false-positive on keys that merely contain a substring like "auth"', () => {
    const result = sanitizeBody({ authorId: '507f1f77bcf86cd799439011', author: 'Jane' }) as Record<string, unknown>
    expect(result.authorId).toBe('507f1f77bcf86cd799439011')
    expect(result.author).toBe('Jane')
  })

  it('caps recursion depth instead of throwing on deeply nested input', () => {
    let deep: unknown = 'leaf'
    for (let i = 0; i < 20; i++) deep = { nested: deep }
    expect(() => sanitizeBody(deep)).not.toThrow()
  })

  it('passes through primitives and null/undefined', () => {
    expect(sanitizeBody(null)).toBeNull()
    expect(sanitizeBody(undefined)).toBeUndefined()
    expect(sanitizeBody(42)).toBe(42)
    expect(sanitizeBody(true)).toBe(true)
  })
})

describe('capSerializedSize', () => {
  it('returns small payloads unchanged', () => {
    const value = { a: 1 }
    expect(capSerializedSize(value)).toBe(value)
  })

  it('replaces oversized payloads with a truncation marker', () => {
    const huge = { blob: 'x'.repeat(20000) }
    const result = capSerializedSize(huge) as Record<string, unknown>
    expect(result.truncated).toBe(true)
  })
})

describe('shouldIgnoreRequest', () => {
  it.each(['/api/health', '/health', '/favicon.ico', '/metrics', '/v0/cdn/logo.png', '/app.js', '/styles.css'])(
    'ignores %s',
    (path: string) => {
      expect(shouldIgnoreRequest(path)).toBe(true)
    },
  )

  it.each(['/api/v1/tasks', '/api/v1/analytics/realtime', '/'])('tracks %s', (path: string) => {
    expect(shouldIgnoreRequest(path)).toBe(false)
  })
})

describe('resolveDeviceType', () => {
  it('classifies bot before other device signals', () => {
    const req = fakeRequest({ useragent: { isBot: true, isMobile: true } })
    expect(resolveDeviceType(req)).toBe('bot')
  })

  it('classifies desktop', () => {
    const req = fakeRequest({ useragent: { isDesktop: true } })
    expect(resolveDeviceType(req)).toBe('desktop')
  })

  it('falls back to unknown when useragent is missing', () => {
    const req = fakeRequest({})
    expect(resolveDeviceType(req)).toBe('unknown')
  })
})

describe('headerString', () => {
  it('returns a plain string header', () => {
    const req = fakeRequest({ headers: { 'user-agent': 'curl/8.0' } })
    expect(headerString(req, 'user-agent')).toBe('curl/8.0')
  })

  it('returns the first value for a multi-value header', () => {
    const req = fakeRequest({ headers: { 'x-forwarded-for': ['1.1.1.1', '2.2.2.2'] } })
    expect(headerString(req, 'x-forwarded-for')).toBe('1.1.1.1')
  })

  it('returns null when absent', () => {
    const req = fakeRequest({ headers: {} })
    expect(headerString(req, 'referer')).toBeNull()
  })
})

describe('resolveGeo', () => {
  it('prefers Vercel geo headers over Cloudflare', () => {
    const req = fakeRequest({
      headers: {
        'x-vercel-ip-country': 'EG',
        'cf-ipcountry': 'US',
        'x-vercel-ip-city': 'Cairo',
      },
    })
    const geo = resolveGeo(req)
    expect(geo.city).toBe('Cairo')
    expect(geo.country).toBeTruthy()
  })

  it('returns nulls when no geo headers are present', () => {
    const req = fakeRequest({ headers: {} })
    const geo = resolveGeo(req)
    expect(geo.country).toBeNull()
    expect(geo.city).toBeNull()
  })
})

describe('resolveRoute', () => {
  it('combines baseUrl and route path when the router matched', () => {
    const req = fakeRequest({ route: { path: '/:id' }, baseUrl: '/api/v1/tasks', path: '/api/v1/tasks/123' })
    expect(resolveRoute(req)).toBe('/api/v1/tasks/:id')
  })

  it('falls back to req.path when unmatched (404)', () => {
    const req = fakeRequest({ path: '/does-not-exist' })
    expect(resolveRoute(req)).toBe('/does-not-exist')
  })
})
