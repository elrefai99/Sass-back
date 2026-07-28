import express, { type Express, type Request, type Response } from 'express'
import client from 'prom-client'
import swaggerUi from 'swagger-ui-express'
import appConfig from './app.config'
import appModule from './app.module'
import { swaggerSpec } from './config/swagger'
import { errorHandler } from './utils/errors/errorHandler'
import { trackAnalytics } from './module/analytics/middleware/track.middleware'

/**
 * Builds the Express application without binding a port.
 *
 * Both entrypoints share this: `src/app.ts` (long-lived Node process, adds
 * socket.io + `listen()`) and `api/index.ts` (Vercel serverless function,
 * which must export a handler and can never listen on a port).
 */
export const createApp = (): Express => {
     const app: Express = express()

     appConfig(app)
     app.use(trackAnalytics)
     appModule(app)

     // Health check
     app.get('/api/health', (_req: Request, res: Response) => {
          res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
     })

     app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
     app.get('/api/docs.json', (_req: Request, res: Response) => {
          res.json(swaggerSpec)
     })

     app.get('/metrics', async (req: Request, res: Response) => {
          const metricsToken = process.env.METRICS_TOKEN
          if (metricsToken && req.headers.authorization !== `Bearer ${metricsToken}`) {
               res.status(401).json({ code: 401, status: 'Unauthorized', message: 'Unauthorized' })
               return
          }
          res.set('Content-Type', client.register.contentType)
          res.end(await client.register.metrics())
     })

     app.use(async (_req: Request, res: Response) => {
          res.status(404).json({
               success: false,
               code: 'NOT_FOUND',
               message: 'This is not the API route you are looking for',
          })
     })

     app.use(errorHandler)

     return app
}

export default createApp
