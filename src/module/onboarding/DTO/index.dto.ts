import { z } from 'zod'
import { SYSTEM_ROLES } from '../../../shared/enums'

const inviteRoleSchema = z.enum(SYSTEM_ROLES).refine((role) => role !== 'owner', 'Owner role cannot be assigned')

export const completeOnboardingSchema = z
  .object({
    extraDepartments: z
      .array(
        z.object({
          name: z.string().trim().min(2).max(50),
          description: z.string().trim().max(200).optional(),
        }),
      )
      .max(20)
      .optional()
      .default([]),
    invitations: z.array(z.string().trim().email().toLowerCase()).max(50).optional().default([]),
  })
  .strip()

export const inviteEmployeesSchema = z
  .object({
    emails: z.array(z.string().trim().email().toLowerCase()).min(1).max(50),
    role: inviteRoleSchema.default('employee'),
  })
  .strip()

export type CompleteOnboardingDTO = z.infer<typeof completeOnboardingSchema>
export type InviteEmployeesDTO = z.infer<typeof inviteEmployeesSchema>
