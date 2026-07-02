import { NotificationModel } from '../../../schema'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { idOf } from '../../../shared/document'
import { AppError } from '../../../utils/errors/app-error'
import { publishNotificationEvent, type NotificationEventPayload } from '../../../shared/notification-events'
import { logger } from '../../../utils/logger'
import { notificationSseBroker } from '../shared/notification.sse'
import type { ListNotificationsQueryDTO } from '../DTO/index.dto'

export class NotificationService {
  async list(userId: string, query: ListNotificationsQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter: Record<string, unknown> = { userId }
    if (typeof query.read === 'boolean') filter.read = query.read

    const [notifications, total] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      NotificationModel.countDocuments(filter),
    ])

    return {
      data: notifications.map((notification) => this.serialize(notification)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async markOneRead(userId: string, notificationId: string) {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true },
    )
    if (!notification) {
      throw AppError.notFound('Notification not found', 'NOT_FOUND')
    }

    const data = this.serialize(notification)
    await this.emit({
      event: 'read',
      userId,
      data,
    })

    return data
  }

  async markAllRead(userId: string) {
    const result = await NotificationModel.updateMany({ userId, read: false }, { read: true })
    await this.emit({
      event: 'read_all',
      userId,
      data: {
        modifiedCount: result.modifiedCount,
      },
    })

    return null
  }

  async streamSnapshot(userId: string) {
    const unreadCount = await NotificationModel.countDocuments({ userId, read: false })
    return {
      unreadCount,
      connectedAt: new Date().toISOString(),
    }
  }

  private async emit(event: Omit<NotificationEventPayload, 'emittedAt'>) {
    try {
      await publishNotificationEvent(event)
    } catch (error) {
      logger.error({ error }, 'Failed to publish notification event')
      notificationSseBroker.emit({
        ...event,
        emittedAt: new Date().toISOString(),
      } as NotificationEventPayload)
    }
  }

  private serialize(notification: any) {
    return {
      id: idOf(notification),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      read: notification.read,
      createdAt: notification.createdAt,
    }
  }
}

export const notificationService = new NotificationService()
