import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'
import { PERMISSION_CATALOG } from '../../permission/utils/catalog'

const catalogKeys = PERMISSION_CATALOG.map((entry) => entry.key) as [string, ...string[]]

export const roleParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listRolesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
})

export const createRoleSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().max(200).optional().default(''),
    permissionKeys: z.array(z.enum(catalogKeys)).default([]),
  })
  .strip()

export const updateRoleSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    description: z.string().trim().max(200).optional(),
    permissionKeys: z.array(z.enum(catalogKeys)).optional(),
  })
  .strip()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export type RoleParamsDTO = z.infer<typeof roleParamsSchema>
export type ListRolesQueryDTO = z.infer<typeof listRolesQuerySchema>
export type CreateRoleDTO = z.infer<typeof createRoleSchema>
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>
