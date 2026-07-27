import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const analyticsListQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
})
export type AnalyticsListQueryDTO = z.infer<typeof analyticsListQuerySchema>

export const analyticsUserParamsSchema = z.object({
  userId: z.string().refine(isObjectId, objectIdSchemaMessage),
})
export type AnalyticsUserParamsDTO = z.infer<typeof analyticsUserParamsSchema>
