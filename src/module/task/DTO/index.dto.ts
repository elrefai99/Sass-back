import { z } from 'zod'
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../shared/enums'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const taskParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority', 'order']).optional().default('order'),
  sortDir: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).optional().default(''),
    status: z.enum(TASK_STATUSES).optional().default('todo'),
    priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
    dueDate: z.coerce.date().optional().nullable(),
    assigneeId: z.string().refine(isObjectId, objectIdSchemaMessage).optional().nullable(),
  })
  .strip()

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const moveTaskSchema = z
  .object({
    status: z.enum(TASK_STATUSES),
    order: z.coerce.number().int().min(0).optional().default(0),
  })
  .strip()

export type TaskParamsDTO = z.infer<typeof taskParamsSchema>
export type ListTasksQueryDTO = z.infer<typeof listTasksQuerySchema>
export type CreateTaskDTO = z.infer<typeof createTaskSchema>
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>
export type MoveTaskDTO = z.infer<typeof moveTaskSchema>
