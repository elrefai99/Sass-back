import { Job, Queue } from 'bullmq'
import type { NotificationType } from '../../../shared/enums'

export type CreateNotificationJob = {
  userId: string
  type: NotificationType
  title: string
  body: string
}

export const notificationQueue = new Queue<CreateNotificationJob>('notificationQueue', {
  connection: {
    url: process.env.REDIS_CACHE_BULLMQ,
  },
})

// Without a listener, an unreachable Redis emits an unhandled 'error' and takes
// the process (or serverless invocation) down. Callers fall back on their own.
notificationQueue.on('error', (err) => console.error('notificationQueue error:', err.message))

const REMOVE_CONFIG = {
  removeOnComplete: {
    age: 60 * 60,
  },
  removeOnFail: {
    age: 24 * 60 * 60,
  },
}

export async function addNotificationJob(data: CreateNotificationJob): Promise<Job<CreateNotificationJob>> {
  return notificationQueue.add('createNotification', data, REMOVE_CONFIG)
}
