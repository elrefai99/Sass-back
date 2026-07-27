import type { Request } from 'express'
import type { DeviceType } from '../../../shared/enums'
import type { GeoInfo } from '../@types'

const SENSITIVE_KEY_PARTS = [
  'password',
  'token',
  'secret',
  'authorization',
  'apikey',
  'creditcard',
  'cardnumber',
  'cvv',
  'ssn',
  'pin',
]

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '')

const isSensitiveKey = (key: string): boolean => {
  const normalized = normalizeKey(key)
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
}

const MAX_SANITIZE_DEPTH = 6
const MAX_STRING_LENGTH = 500
const MAX_ARRAY_ITEMS = 50

export const sanitizeBody = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) return value

  if (depth >= MAX_SANITIZE_DEPTH) return '[MAX_DEPTH]'

  if (Buffer.isBuffer(value)) return '[BUFFER]'

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…[TRUNCATED]` : value
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeBody(item, depth + 1))
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = isSensitiveKey(key) ? '[REDACTED]' : sanitizeBody(val, depth + 1)
    }
    return result
  }

  return '[UNSUPPORTED]'
}

const MAX_SERIALIZED_LENGTH = 8000

export const capSerializedSize = (value: unknown): unknown => {
  if (value === null || value === undefined) return value
  try {
    const serialized = JSON.stringify(value)
    if (serialized.length <= MAX_SERIALIZED_LENGTH) return value
    return { truncated: true, reason: 'payload exceeds analytics logging size limit' }
  } catch {
    return { truncated: true, reason: 'payload not serializable' }
  }
}

export const headerString = (req: Request, name: string): string | null => {
  const value = req.headers[name]
  if (Array.isArray(value)) return value[0] ?? null
  return typeof value === 'string' ? value : null
}

export const resolveDeviceType = (req: Request): DeviceType => {
  const ua = (req as unknown as { useragent?: Record<string, unknown> }).useragent
  if (!ua) return 'unknown'
  if (ua.isBot) return 'bot'
  if (ua.isTablet) return 'tablet'
  if (ua.isMobile) return 'mobile'
  if (ua.isDesktop) return 'desktop'
  return 'unknown'
}

export const resolveBrowser = (req: Request): string | null => {
  const ua = (req as unknown as { useragent?: Record<string, unknown> }).useragent
  const browser = ua?.browser
  const version = ua?.version
  if (!browser || typeof browser !== 'string') return null
  return typeof version === 'string' && version.length > 0 ? `${browser} ${version}` : browser
}

export const resolveOS = (req: Request): string | null => {
  const ua = (req as unknown as { useragent?: Record<string, unknown> }).useragent
  const os = ua?.os
  return typeof os === 'string' && os.length > 0 ? os : null
}

const displayNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' })
  } catch {
    return null
  }
})()

const countryNameFromCode = (code: string | null): string | null => {
  if (!code || code === 'XX' || code === 'T1') return null
  return displayNames?.of(code) ?? code
}

const safeDecode = (value: string | null): string | null => {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const resolveGeo = (req: Request): GeoInfo => {
  const country =
    countryNameFromCode(headerString(req, 'x-vercel-ip-country')) ?? countryNameFromCode(headerString(req, 'cf-ipcountry'))
  const region = headerString(req, 'x-vercel-ip-country-region') ?? headerString(req, 'cf-region')
  const city = headerString(req, 'x-vercel-ip-city') ?? headerString(req, 'cf-ipcity')
  const timezone = headerString(req, 'x-vercel-ip-timezone')
  const isp = headerString(req, 'cf-isp')
  const asn = headerString(req, 'x-vercel-ip-as-number') ?? headerString(req, 'cf-asn')

  return {
    country: safeDecode(country),
    region: safeDecode(region),
    city: safeDecode(city),
    timezone,
    isp,
    asn,
  }
}

export const resolveRoute = (req: Request): string => {
  const route = (req as unknown as { route?: { path?: string } }).route
  return route?.path ? `${req.baseUrl}${route.path}` : req.path
}

const STATIC_ASSET_EXTENSIONS = /\.(css|js|mjs|map|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|eot|txt|xml|json)$/i

const IGNORED_EXACT_PATHS = new Set(['/api/health', '/health', '/favicon.ico', '/metrics'])
const IGNORED_PATH_PREFIXES = ['/v0/cdn']

export const shouldIgnoreRequest = (path: string): boolean => {
  if (IGNORED_EXACT_PATHS.has(path)) return true
  if (IGNORED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) return true
  return STATIC_ASSET_EXTENSIONS.test(path)
}
