import type { Request, Response } from 'express'
import { subscribeToNotificationEvents, type NotificationEventPayload } from '../../../shared/notification-events'
import { logger } from '../../../utils/logger'

type SseClient = {
  id: string
  userId: string
  response: Response
}

class NotificationSseBroker {
  private clients = new Map<string, Map<string, SseClient>>()
  private heartbeat?: NodeJS.Timeout
  private subscribed = false

  async connect(req: Request, res: Response, userId: string, initialData: unknown): Promise<void> {
    await this.ensureStarted()

    res.status(200)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()

    const client: SseClient = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId,
      response: res,
    }

    const userClients = this.clients.get(userId) ?? new Map<string, SseClient>()
    userClients.set(client.id, client)
    this.clients.set(userId, userClients)

    this.write(res, 'connected', initialData)

    req.on('close', () => {
      this.removeClient(client)
    })
  }

  emit(event: NotificationEventPayload): void {
    const clients = this.clients.get(event.userId)
    if (!clients?.size) return

    for (const client of clients.values()) {
      this.write(client.response, event.event, event.data)
    }
  }

  private async ensureStarted(): Promise<void> {
    if (!this.heartbeat) {
      this.heartbeat = setInterval(() => {
        for (const clients of this.clients.values()) {
          for (const client of clients.values()) {
            this.write(client.response, 'ping', { at: new Date().toISOString() })
          }
        }
      }, 25000)
      this.heartbeat.unref?.()
    }

    if (this.subscribed) return
    this.subscribed = true

    try {
      await subscribeToNotificationEvents((event) => this.emit(event))
    } catch (error) {
      this.subscribed = false
      logger.error({ error }, 'Notification SSE Redis subscription failed')
    }
  }

  private write(res: Response, event: string, data: unknown): void {
    try {
      res.write(`event: ${event}\n`)
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    } catch (error) {
      logger.error({ error }, 'Failed to write notification SSE event')
    }
  }

  private removeClient(client: SseClient): void {
    const clients = this.clients.get(client.userId)
    if (!clients) return

    clients.delete(client.id)
    if (clients.size === 0) {
      this.clients.delete(client.userId)
    }
  }
}

export const notificationSseBroker = new NotificationSseBroker()
