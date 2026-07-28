import mongoose, { connect } from "mongoose"
import os from 'node:os';

/**
 * Serverless-safe connection.
 *
 * A Vercel function may be re-invoked on a warm container, so the connection
 * promise is cached on `globalThis` to survive module re-evaluation, and a
 * failure never calls `process.exit` (that surfaces as an opaque
 * FUNCTION_INVOCATION_FAILED instead of a readable error).
 */
type MongoCache = { promise: Promise<typeof mongoose> | null }
const globalCache = globalThis as typeof globalThis & { __mongoCache?: MongoCache }
const cache: MongoCache = (globalCache.__mongoCache ??= { promise: null })

export const connectMongo = async (): Promise<void> => {
     if (mongoose.connection.readyState === 1) return

     const uri = process.env.MONGODB_URI
     if (!uri) throw new Error('MONGODB_URI is not set')

     cache.promise ??= connect(uri, {
          serverSelectionTimeoutMS: 8000,
          maxPoolSize: 5,
     })

     try {
          await cache.promise
     } catch (err) {
          cache.promise = null
          throw err
     }
}

function getLocalIP(): any {
     const interfaces = os.networkInterfaces();
     for (const name in interfaces) {
          for (const iface of interfaces[name]!) {
               if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
               }
          }
     }
}

export const mongoDBConfig = async (retries = 5): Promise<void> => {
     const uri = process.env.MONGODB_URI as string
     try {
          await connect(uri, { serverSelectionTimeoutMS: 5000 });
          console.log('✅ Success connected with MongoDB of SwakipOS')
          console.log('ɪᴘ My IP Address:', getLocalIP());
     } catch (err) {
          if (retries > 0) {
               console.warn(`MongoDB connection failed. Retrying... (${retries} left)`);
               await new Promise(r => setTimeout(r, 3000));
               return mongoDBConfig(retries - 1);
          }
          console.error('MongoDB connection error:', err);
          process.exit(1);
     }
}
