import express, { type Application, type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import { limiter } from './utils/limit-request'
import client from 'prom-client'
import * as useragent from 'express-useragent'
import { randomUUID } from 'node:crypto'

const register = new client.Registry()
client.collectDefaultMetrics({ register })

// metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
})
register.registerMetric(httpRequestsTotal)

// Histogram: HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5],
})
register.registerMetric(httpRequestDuration)

// Gauge: active requests count
const activeRequests = new client.Gauge({
  name: 'active_requests',
  help: 'Number of active HTTP requests',
})

register.registerMetric(activeRequests)

export const allowedOrigins: string[] = [
  process.env.SITE_URL_TEST as string,
  process.env.SITE_URL_LIVE as string,
]
const corsOptions: object = {
  origin: (origin: any, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}

export default (app: Application) => {
  app.use(cors(corsOptions))
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.API_LINK as string],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    }),
  )
  app.use(compression())
  app.use(
    express.json({
      limit: '2mb',
    }),
  )
  app.use(
    express.urlencoded({
      extended: true,
    }),
  )
  app.use(cookieParser())
  app.use('/v0/cdn', express.static('cdn'))
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  }
  app.use(useragent.express())
  app.set('trust proxy', 1)
  app.use(async (req: Request | any, res: Response, next: NextFunction) => {
    req.requestId = req.headers['x-request-id'] || randomUUID()
    res.setHeader('X-Request-Id', req.requestId)

    // get langouage of headers
    req.lang =
      req.headers['accept-language'] === 'ar' ||
        req.headers['accept-language'] === 'en'
        ? req.headers['accept-language']
        : ('en' as string)
    req.mobileApp =
      req.headers.app === 'app' ? 'app' : (req.headers.app as string)
    req.clientIP = req.ip || req.socket.remoteAddress || ('' as string)

    if (req.path === '/metrics') {
      return next()
    }
    activeRequests.inc()
    const end = httpRequestDuration.startTimer()

    res.on('finish', () => {
      activeRequests.dec()
      const routeLabel = req.route ? `${req.baseUrl}${req.route.path}` : req.path
      httpRequestsTotal
        .labels(req.method, routeLabel, res.statusCode.toString())
        .inc()
      end({
        method: req.method,
        route: routeLabel,
        status: res.statusCode.toString(),
      })
    })
    next()
  })
  app.use(limiter)
}
