import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const notificationParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  read: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
})

export type NotificationParamsDTO = z.infer<typeof notificationParamsSchema>
export type ListNotificationsQueryDTO = z.infer<typeof listNotificationsQuerySchema>
