import { createClient } from 'redis'
import { logger } from '../utils/logger'

export const CHAT_EVENTS_CHANNEL = 'chat:events'

export type ChatMessageView = {
  id: string
  conversationId: string
  senderId: string | null
  senderName: string
  type: string
  body: string
  attachments: { url: string; name: string; mimeType: string; size: number }[]
  editedAt: string | null
  deletedAt: string | null
  createdAt: string
}

export type ChatConversationSummary = {
  id: string
  lastMessage: { body: string; senderId: string | null; senderName: string; at: string | null } | null
  lastMessageAt: string | null
}

/**
 * Chat realtime events. Every payload carries `recipientIds` — the set of user
 * ids that should receive it — so the SSE broker can fan out per connected user
 * without re-querying conversation membership.
 */
export type ChatEventPayload =
  | {
      event: 'message.created'
      recipientIds: string[]
      conversationId: string
      data: ChatMessageView
      emittedAt: string
    }
  | {
      event: 'conversation.updated'
      recipientIds: string[]
      conversationId: string
      data: ChatConversationSummary | null
      emittedAt: string
    }
  | {
      event: 'message.read'
      recipientIds: string[]
      conversationId: string
      data: { userId: string; lastReadAt: string }
      emittedAt: string
    }
  | {
      event: 'typing'
      recipientIds: string[]
      conversationId: string
      data: { userId: string; userName: string; typing: boolean }
      emittedAt: string
    }

let publisherClient: any

const redisUrl = (): string | undefined =>
  process.env.REDIS_CACHE_BULLMQ || process.env.REDIS_CACHE_DEV || process.env.REDIS_CACHE_LIVE

const getPublisher = async () => {
  if (publisherClient?.isOpen) return publisherClient

  const url = redisUrl()
  if (!url) {
    throw new Error('Missing Redis URL for chat events')
  }

  publisherClient = createClient({ url })
  publisherClient.on('error', (error: Error) => {
    logger.error({ error }, 'Chat event publisher error')
  })
  await publisherClient.connect()
  return publisherClient
}

export const publishChatEvent = async (event: Omit<ChatEventPayload, 'emittedAt'>): Promise<void> => {
  const client = await getPublisher()
  await client.publish(
    CHAT_EVENTS_CHANNEL,
    JSON.stringify({
      ...event,
      emittedAt: new Date().toISOString(),
    }),
  )
}

export const subscribeToChatEvents = async (
  handler: (event: ChatEventPayload) => void,
): Promise<() => Promise<void>> => {
  const url = redisUrl()
  if (!url) {
    throw new Error('Missing Redis URL for chat events')
  }

  const subscriber = createClient({ url })
  subscriber.on('error', (error: Error) => {
    logger.error({ error }, 'Chat event subscriber error')
  })

  await subscriber.connect()
  await subscriber.subscribe(CHAT_EVENTS_CHANNEL, (message) => {
    try {
      handler(JSON.parse(message) as ChatEventPayload)
    } catch (error) {
      logger.error({ error, message }, 'Invalid chat event payload')
    }
  })

  return async () => {
    await subscriber.unsubscribe(CHAT_EVENTS_CHANNEL)
    await subscriber.quit()
  }
}
