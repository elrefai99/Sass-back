import { z } from 'zod'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'
import { passwordMeetsPolicy } from '../../../shared/security'

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    avatarUrl: z.string().trim().url().nullable().optional(),
  })
  .strip()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z
      .string()
      .min(8)
      .refine(passwordMeetsPolicy, 'Password must contain at least one uppercase letter and one digit'),
  })
  .strict()

export const sessionParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>
export type SessionParamsDTO = z.infer<typeof sessionParamsSchema>
