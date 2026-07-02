import { z } from 'zod'
import { PROJECT_STATUSES } from '../../../shared/enums'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const projectParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
})

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).optional().default(''),
    status: z.enum(PROJECT_STATUSES).optional().default('planning'),
    ownerId: z.string().refine(isObjectId, objectIdSchemaMessage),
    departmentId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
    teamId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
  })
  .strip()

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export type ProjectParamsDTO = z.infer<typeof projectParamsSchema>
export type ListProjectsQueryDTO = z.infer<typeof listProjectsQuerySchema>
export type CreateProjectDTO = z.infer<typeof createProjectSchema>
export type UpdateProjectDTO = z.infer<typeof updateProjectSchema>
