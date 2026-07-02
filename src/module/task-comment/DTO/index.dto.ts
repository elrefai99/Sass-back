import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const taskCommentTaskParamsSchema = z.object({
  taskId: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const taskCommentParamsSchema = z.object({
  taskId: z.string().refine(isObjectId, objectIdSchemaMessage),
  commentId: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const addCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(2000),
  })
  .strip()

export type TaskCommentTaskParamsDTO = z.infer<typeof taskCommentTaskParamsSchema>
export type TaskCommentParamsDTO = z.infer<typeof taskCommentParamsSchema>
export type ListCommentsQueryDTO = z.infer<typeof listCommentsQuerySchema>
export type AddCommentDTO = z.infer<typeof addCommentSchema>
