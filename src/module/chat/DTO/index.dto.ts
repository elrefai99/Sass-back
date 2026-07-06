import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

const objectId = z.string().refine(isObjectId, objectIdSchemaMessage)

export const conversationParamsSchema = z.object({
  id: objectId,
})

export const conversationMemberParamsSchema = z.object({
  id: objectId,
  userId: objectId,
})

export const listConversationsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
})

export const listMessagesQuerySchema = z.object({
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(30),
  // Cursor: fetch messages created strictly before this ISO timestamp.
  before: z.string().datetime().optional(),
})

export const createConversationSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('dm'),
      userId: objectId,
    }),
    z.object({
      type: z.literal('group'),
      name: z.string().trim().min(1).max(80),
      avatarUrl: z.string().url().optional(),
      memberIds: z.array(objectId).min(1).max(256),
    }),
  ])

const attachmentSchema = z.object({
  url: z.string().url(),
  name: z.string().max(256).optional().default(''),
  mimeType: z.string().max(128).optional().default(''),
  size: z.number().int().min(0).optional().default(0),
})

export const sendMessageSchema = z
  .object({
    body: z.string().trim().max(5000).optional().default(''),
    attachments: z.array(attachmentSchema).max(10).optional().default([]),
  })
  .refine((value) => value.body.length > 0 || value.attachments.length > 0, {
    message: 'A message must have text or at least one attachment',
    path: ['body'],
  })

export const updateConversationSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update' })

export const addMembersSchema = z.object({
  memberIds: z.array(objectId).min(1).max(256),
})

export const typingSchema = z.object({
  typing: z.boolean().optional().default(true),
})

export type ConversationParamsDTO = z.infer<typeof conversationParamsSchema>
export type ConversationMemberParamsDTO = z.infer<typeof conversationMemberParamsSchema>
export type ListConversationsQueryDTO = z.infer<typeof listConversationsQuerySchema>
export type ListMessagesQueryDTO = z.infer<typeof listMessagesQuerySchema>
export type CreateConversationDTO = z.infer<typeof createConversationSchema>
export type SendMessageDTO = z.infer<typeof sendMessageSchema>
export type UpdateConversationDTO = z.infer<typeof updateConversationSchema>
export type AddMembersDTO = z.infer<typeof addMembersSchema>
export type TypingDTO = z.infer<typeof typingSchema>
