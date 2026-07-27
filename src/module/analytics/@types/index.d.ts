import type { DeviceType } from '../../../shared/enums'

export type GeoInfo = {
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  isp: string | null
  asn: string | null
}

export type AnalyticsEventInput = {
  requestId: string
  companyId?: string | null
  userId?: string | null
  userEmail?: string | null
  visitorId: string

  ip: string | null
  xForwardedFor: string | null
  userAgent: string | null
  browser: string | null
  os: string | null
  deviceType: DeviceType

  method: string
  url: string
  route: string
  query: unknown
  body: unknown

  statusCode: number
  responseTimeMs: number

  referer: string | null
  origin: string | null
  host: string | null
  acceptLanguage: string | null

  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  isp: string | null
  asn: string | null

  createdAt: Date
}

export type VisitorSummary = {
  visitorId: string
  userId: string | null
  isAuthenticated: boolean
  requestCount: number
  firstSeen: Date
  lastSeen: Date
  lastRoute: string
  country: string | null
}

export type UserActivitySummary = {
  userId: string
  userEmail: string | null
  requestCount: number
  firstSeen: Date
  lastSeen: Date
  lastRoute: string
}

export type PageViewSummary = {
  route: string
  count: number
  avgResponseTimeMs: number
  lastSeen: Date
}

export type RealtimeStats = {
  activeVisitors: number
  onlineUsers: number
  totalRequestsToday: number
  uniqueVisitorsToday: number
}
