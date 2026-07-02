import './config/dotenv'
import { logger } from './utils/logger'
process
     .on('unhandledRejection', (reason, promise) => {
          console.error(reason, 'Unhandled Rejection at Promise', promise)
          logger.error({
               message: 'Unhandled Rejection',
               reason: reason instanceof Error ? reason.message : reason,
               stack: reason instanceof Error ? reason.stack : undefined,
               promise,
          })
     })
     .on('uncaughtException', (err) => {
          console.error(err, '\n Uncaught Exception thrown \n')
          logger.error({
               message: 'Uncaught Exception',
               error: err.message,
               stack: err.stack,
          })

          // allow logger to flush before exit
          setTimeout(() => {
               process.exit(1)
          }, 500)
     })
import express, { type Express, type Request, type Response } from 'express'
import client from 'prom-client'
import * as http from 'http'
import swaggerUi from 'swagger-ui-express'
import { Server as SocketIOServer } from 'socket.io'
import { allowedOrigins } from './app.config'
import appConfig from './app.config'
import appModule from './app.module'
import { redisConfig } from './config/redis'
import { mongoDBConfig } from './config/mongoDB'
import { swaggerSpec } from './config/swagger'
import { errorHandler } from './utils/errors/errorHandler'

const app: Express = express()

const server = http.createServer(app)
export let ioSocket: SocketIOServer = new SocketIOServer(server, {
     cors: {
          origin: allowedOrigins,
     },
     destroyUpgrade: false,
})

appConfig(app)
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
const PORT: number = Number(process.env.PORT) || 9999

async function startServer() {
     try {
          await Promise.all([
               mongoDBConfig(),
               redisConfig(),
          ]).then(() => {
               server.listen(PORT, () => {
                    console.log('🌐 Server is running on:', `${process.env.API_LINK as string}`)
               })
          })
     } catch (error: any) {
          logger.error({
               message: 'Failed to start server',
               error: error?.message,
               stack: error?.stack,
          })
          process.exit(1)
     }
}

if (process.env.NODE_ENV !== 'test') {
     startServer()
}

export default server
