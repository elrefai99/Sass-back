import '../src/config/dotenv'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createApp } from '../src/create-app'
import { connectMongo } from '../src/config/mongoDB'

/**
 * Vercel serverless entrypoint.
 *
 * Differences from `src/app.ts` (the long-lived Node process):
 * - never calls `listen()` — Vercel invokes the exported handler directly
 * - no socket.io and no Redis connect (a serverless function has no persistent
 *   process to hold them)
 * - MongoDB is connected lazily per invocation and cached on a warm container
 * - missing env vars return a readable 500 instead of `process.exit(1)`, which
 *   Vercel reports only as an opaque FUNCTION_INVOCATION_FAILED
 */
const REQUIRED_VARS = ['JWT_ACCESS_SECRET', 'MONGODB_URI'] as const

const app = createApp()

/** Reachable even when the env or the database is broken, so a bad deploy is diagnosable. */
const NO_DB_ROUTES = ['/api/health', '/api/docs', '/api/docs.json', '/metrics']

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
     const path = (req.url ?? '').split('?')[0] ?? ''
     if (NO_DB_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))) {
          app(req as any, res as any)
          return
     }

     const missing = REQUIRED_VARS.filter((key) => !process.env[key]?.trim())
     if (missing.length > 0) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
               JSON.stringify({
                    success: false,
                    code: 'MISSING_ENV',
                    message: `Missing required environment variables: ${missing.join(', ')}`,
               }),
          )
          return
     }

     try {
          await connectMongo()
     } catch (error: any) {
          console.error('MongoDB connection error:', error)
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(
               JSON.stringify({
                    success: false,
                    code: 'DB_UNAVAILABLE',
                    message: error?.message ?? 'Database connection failed',
               }),
          )
          return
     }

     app(req as any, res as any)
}
