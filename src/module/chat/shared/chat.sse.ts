import type { Request, Response } from 'express'
import { subscribeToChatEvents, type ChatEventPayload } from '../../../shared/chat-events'
import { logger } from '../../../utils/logger'

type SseClient = {
  id: string
  userId: string
  response: Response
}

/**
 * Fans chat events out to connected users over SSE. Mirrors the notification
 * broker: clients register by userId, a single Redis subscription feeds every
 * node, and each event carries the recipient user ids to deliver to.
 */
class ChatSseBroker {
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

  emit(event: ChatEventPayload): void {
    for (const recipientId of event.recipientIds) {
      const clients = this.clients.get(recipientId)
      if (!clients?.size) continue

      for (const client of clients.values()) {
        this.write(client.response, event.event, {
          conversationId: event.conversationId,
          data: event.data,
          emittedAt: event.emittedAt,
        })
      }
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
      await subscribeToChatEvents((event) => this.emit(event))
    } catch (error) {
      this.subscribed = false
      logger.error({ error }, 'Chat SSE Redis subscription failed')
    }
  }

  private write(res: Response, event: string, data: unknown): void {
    try {
      res.write(`event: ${event}\n`)
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    } catch (error) {
      logger.error({ error }, 'Failed to write chat SSE event')
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

export const chatSseBroker = new ChatSseBroker()
