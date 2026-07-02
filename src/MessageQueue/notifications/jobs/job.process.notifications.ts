import type { Job } from 'bullmq'
import { NotificationModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { publishNotificationEvent, type NotificationViewPayload } from '../../../shared/notification-events'
import type { CreateNotificationJob } from '../Queue/queue.notification'

const serializeNotification = (notification: any): NotificationViewPayload => ({
  id: idOf(notification),
  type: notification.type,
  title: notification.title,
  body: notification.body,
  read: notification.read,
  createdAt: notification.createdAt,
})

export const notificationJobProcessor = async (job: Job<CreateNotificationJob>): Promise<NotificationViewPayload> => {
  switch (job.name) {
    case 'createNotification': {
      const notification = await NotificationModel.create(job.data)
      const data = serializeNotification(notification)

      await publishNotificationEvent({
        event: 'created',
        userId: job.data.userId,
        data,
      })

      return data
    }
    default:
      throw new Error(`Unknown notification job: ${job.name}`)
  }
}
