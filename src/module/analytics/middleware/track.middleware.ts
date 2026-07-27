import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { generateUUID } from '../../../utils/uuid'
import { logger } from '../../../utils/logger'
import { analyticsService } from '../Service/analytics.service'
import {
  capSerializedSize,
  headerString,
  resolveBrowser,
  resolveDeviceType,
  resolveGeo,
  resolveOS,
  resolveRoute,
  sanitizeBody,
  shouldIgnoreRequest,
} from '../utils/parse-request'

const VISITOR_COOKIE = 'visitorId'
const VISITOR_COOKIE_MAX_AGE_MS = 400 * 24 * 60 * 60 * 1000 // ~400 days — the Chrome-enforced cookie expiry cap

const ensureVisitorId = (req: Request, res: Response): string => {
  const existing = (req as any).cookies?.[VISITOR_COOKIE]
  if (typeof existing === 'string' && existing.length > 0) return existing

  const visitorId = generateUUID()
  res.cookie(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: VISITOR_COOKIE_MAX_AGE_MS,
    path: '/',
  })
  return visitorId
}

export const trackAnalytics: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (shouldIgnoreRequest(req.path)) {
      next()
      return
    }

    const startedAt = process.hrtime.bigint()
    const cookieVisitorId = ensureVisitorId(req, res)
    const geo = resolveGeo(req)

    res.on('finish', () => {
      try {
        const responseTimeMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

        analyticsService
          .recordEvent({
            requestId: req.requestId ?? generateUUID(),
            companyId: req.user?.companyId ?? null,
            userId: req.user?.id ?? null,
            userEmail: req.user?.email ?? null,
            visitorId: req.user?.id ?? cookieVisitorId,

            ip: req.clientIP ?? req.ip ?? null,
            xForwardedFor: headerString(req, 'x-forwarded-for'),
            userAgent: headerString(req, 'user-agent'),
            browser: resolveBrowser(req),
            os: resolveOS(req),
            deviceType: resolveDeviceType(req),

            method: req.method,
            url: req.originalUrl,
            route: resolveRoute(req),
            query: capSerializedSize(sanitizeBody({ ...req.query })),
            body: capSerializedSize(sanitizeBody(req.body)),

            statusCode: res.statusCode,
            responseTimeMs: Math.round(responseTimeMs),

            referer: headerString(req, 'referer') ?? headerString(req, 'referrer'),
            origin: headerString(req, 'origin'),
            host: headerString(req, 'host'),
            acceptLanguage: headerString(req, 'accept-language'),

            country: geo.country,
            region: geo.region,
            city: geo.city,
            timezone: geo.timezone,
            isp: geo.isp,
            asn: geo.asn,

            createdAt: new Date(),
          })
          .catch((error) => {
            logger.error({ error }, 'Analytics tracking failed')
          })
      } catch (error) {
        logger.error({ error }, 'Analytics tracking failed synchronously in finish handler')
      }
    })

    next()
  } catch (error) {
    logger.error({ error }, 'Analytics middleware failed; skipping tracking for this request')
    next()
  }
}
