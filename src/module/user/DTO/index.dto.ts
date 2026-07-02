import { z } from 'zod'
import { SYSTEM_ROLES } from '../../../shared/enums'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const userParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listUsersQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(SYSTEM_ROLES).optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
})

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    role: z.enum(SYSTEM_ROLES).optional(),
    customRoleId: z
      .string()
      .refine(isObjectId, objectIdSchemaMessage)
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strip()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export type UserParamsDTO = z.infer<typeof userParamsSchema>
export type ListUsersQueryDTO = z.infer<typeof listUsersQuerySchema>
export type UpdateUserDTO = z.infer<typeof updateUserSchema>
