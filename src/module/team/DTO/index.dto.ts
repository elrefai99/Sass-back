import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const teamParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listTeamsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
})

export const createTeamSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().max(200).optional().default(''),
    departmentId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
    leadId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
    memberIds: z.array(z.string().refine(isObjectId, objectIdSchemaMessage)).optional().default([]),
  })
  .strip()

export const updateTeamSchema = createTeamSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
)

export type TeamParamsDTO = z.infer<typeof teamParamsSchema>
export type ListTeamsQueryDTO = z.infer<typeof listTeamsQuerySchema>
export type CreateTeamDTO = z.infer<typeof createTeamSchema>
export type UpdateTeamDTO = z.infer<typeof updateTeamSchema>
