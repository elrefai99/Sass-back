import { createClient } from 'redis'
import { logger } from '../utils/logger'
import type { NotificationType } from './enums'

export const NOTIFICATION_EVENTS_CHANNEL = 'notifications:events'

export type NotificationViewPayload = {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  createdAt: Date | string
}

export type NotificationEventPayload =
  | {
      event: 'created'
      userId: string
      data: NotificationViewPayload
      emittedAt: string
    }
  | {
      event: 'read'
      userId: string
      data: NotificationViewPayload
      emittedAt: string
    }
  | {
      event: 'read_all'
      userId: string
      data: { modifiedCount: number }
      emittedAt: string
    }

let publisherClient: any

const redisUrl = (): string | undefined => process.env.REDIS_CACHE_BULLMQ || process.env.REDIS_CACHE_DEV || process.env.REDIS_CACHE_LIVE

const getPublisher = async () => {
  if (publisherClient?.isOpen) return publisherClient

  const url = redisUrl()
  if (!url) {
    throw new Error('Missing Redis URL for notification events')
  }

  publisherClient = createClient({ url })
  publisherClient.on('error', (error: Error) => {
    logger.error({ error }, 'Notification event publisher error')
  })
  await publisherClient.connect()
  return publisherClient
}

export const publishNotificationEvent = async (event: Omit<NotificationEventPayload, 'emittedAt'>): Promise<void> => {
  const client = await getPublisher()
  await client.publish(
    NOTIFICATION_EVENTS_CHANNEL,
    JSON.stringify({
      ...event,
      emittedAt: new Date().toISOString(),
    }),
  )
}

export const subscribeToNotificationEvents = async (
  handler: (event: NotificationEventPayload) => void,
): Promise<() => Promise<void>> => {
  const url = redisUrl()
  if (!url) {
    throw new Error('Missing Redis URL for notification events')
  }

  const subscriber = createClient({ url })
  subscriber.on('error', (error: Error) => {
    logger.error({ error }, 'Notification event subscriber error')
  })

  await subscriber.connect()
  await subscriber.subscribe(NOTIFICATION_EVENTS_CHANNEL, (message) => {
    try {
      handler(JSON.parse(message) as NotificationEventPayload)
    } catch (error) {
      logger.error({ error, message }, 'Invalid notification event payload')
    }
  })

  return async () => {
    await subscriber.unsubscribe(NOTIFICATION_EVENTS_CHANNEL)
    await subscriber.quit()
  }
}
