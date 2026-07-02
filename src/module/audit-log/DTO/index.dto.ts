import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const listAuditLogsQuerySchema = z.object({
  actorId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
  action: z.string().trim().max(100).optional(),
  entity: z.string().trim().max(200).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
})

export type ListAuditLogsQueryDTO = z.infer<typeof listAuditLogsQuerySchema>
