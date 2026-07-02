import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const departmentParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listDepartmentsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
})

export const createDepartmentSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().max(200).optional().default(''),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  })
  .strip()

export const updateDepartmentSchema = createDepartmentSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
)

export type DepartmentParamsDTO = z.infer<typeof departmentParamsSchema>
export type ListDepartmentsQueryDTO = z.infer<typeof listDepartmentsQuerySchema>
export type CreateDepartmentDTO = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentDTO = z.infer<typeof updateDepartmentSchema>
