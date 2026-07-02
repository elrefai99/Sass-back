import { NotificationModel } from '../schema'
import { addNotificationJob } from '../MessageQueue/notifications/Queue/queue.notification'
import { idOf } from './document'
import type { NotificationType } from './enums'
import { publishNotificationEvent } from './notification-events'
import { logger } from '../utils/logger'

export const notifyUser = async (input: {
  userId?: string
  type: NotificationType
  title: string
  body: string
}): Promise<void> => {
  if (!input.userId) return

  try {
    await addNotificationJob({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
    })
  } catch (error) {
    logger.error({ error }, 'Failed to enqueue notification job; creating notification inline')
    const notification = await NotificationModel.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
    })

    try {
      await publishNotificationEvent({
        event: 'created',
        userId: input.userId,
        data: {
          id: idOf(notification),
          type: notification.type,
          title: notification.title,
          body: notification.body,
          read: notification.read,
          createdAt: notification.createdAt,
        },
      })
    } catch (publishError) {
      logger.error({ error: publishError }, 'Failed to publish inline notification event')
    }
  }
}
