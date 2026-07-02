import { z } from 'zod'
import { EMPLOYEE_STATUSES, SYSTEM_ROLES } from '../../../shared/enums'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

const assignableRoleSchema = z.enum(SYSTEM_ROLES).refine((role) => role !== 'owner', 'Owner role cannot be assigned')

export const employeeParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().max(100).optional(),
  departmentId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  sortBy: z.enum(['name', 'salary', 'joinedAt']).optional().default('joinedAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const createEmployeeSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().toLowerCase(),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(20)
      .regex(/^[+]?[0-9\s\-()]{7,20}$/),
    departmentId: z.string().refine(isObjectId, objectIdSchemaMessage),
    role: z.string().trim().min(2).max(80),
    systemRole: assignableRoleSchema.optional().default('employee'),
    salary: z.coerce.number().positive().max(10000000),
    status: z.enum(EMPLOYEE_STATUSES).optional().default('active'),
  })
  .strip()

export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export type EmployeeParamsDTO = z.infer<typeof employeeParamsSchema>
export type ListEmployeesQueryDTO = z.infer<typeof listEmployeesQuerySchema>
export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>
