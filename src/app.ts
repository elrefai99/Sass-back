import './config/dotenv'
import { validateEnv } from './config/validateEnv'
import { logger } from './utils/logger'

validateEnv()
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
import type { Express } from 'express'
import * as http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { allowedOrigins } from './app.config'
import { createApp } from './create-app'
import { redisConfig } from './config/redis'
import { mongoDBConfig } from './config/mongoDB'

const app: Express = createApp()

const server = http.createServer(app)
export let ioSocket: SocketIOServer = new SocketIOServer(server, {
     cors: {
          origin: allowedOrigins,
     },
     destroyUpgrade: false,
})

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
