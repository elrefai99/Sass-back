import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const attendanceHistoryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
    employeeId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, 'from must be before to')

export const monthlyReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  employeeId: z.string().refine(isObjectId, objectIdSchemaMessage).optional(),
})

export type AttendanceHistoryQueryDTO = z.infer<typeof attendanceHistoryQuerySchema>
export type MonthlyReportQueryDTO = z.infer<typeof monthlyReportQuerySchema>
