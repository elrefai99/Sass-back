import type { Request, Response } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

const clientKey = (req: Request | any): string => ipKeyGenerator(req.ip || req.socket?.remoteAddress || '')

export const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  handler: (_, res: Response) => {
    res.status(429).json({ code: 429, status: 'Too Many Requests', message: 'Too many requests from this IP, please try again after an 2 min' })
  },
})

export const authlimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  handler: (_, res: Response) => {
    res.status(429).json({ code: 429, status: 'Too Many Requests', message: 'Too many requests from this IP, please try again after an 30 sec' })
  },
})
