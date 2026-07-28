import { Job, Queue } from 'bullmq'
import type { AnalyticsEventInput } from '../../../module/analytics/@types'

export const analyticsQueue = new Queue<AnalyticsEventInput>('analyticsQueue', {
  connection: {
    url: process.env.REDIS_CACHE_BULLMQ,
  },
})

// Without a listener, an unreachable Redis emits an unhandled 'error' and takes
// the process (or serverless invocation) down.
analyticsQueue.on('error', (err) => console.error('analyticsQueue error:', err.message))

const REMOVE_CONFIG = {
  removeOnComplete: {
    age: 60 * 60,
  },
  removeOnFail: {
    age: 24 * 60 * 60,
  },
}

export async function addAnalyticsEventJob(data: AnalyticsEventInput): Promise<Job<AnalyticsEventInput>> {
  return analyticsQueue.add('logEvent', data, REMOVE_CONFIG)
}
