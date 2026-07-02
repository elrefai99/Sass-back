import { z } from 'zod'
import { INDUSTRIES, LANGUAGES } from '../../../shared/enums'

const isTimezone = (value: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
}

export const updateCompanySettingsSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    industry: z.enum(INDUSTRIES).optional(),
    timezone: z.string().trim().refine(isTimezone, 'Invalid IANA timezone').optional(),
    language: z.enum(LANGUAGES).optional(),
    logoUrl: z.string().trim().url().optional(),
  })
  .strip()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export type UpdateCompanySettingsDTO = z.infer<typeof updateCompanySettingsSchema>
