import { z } from 'zod'
import { COMPANY_SIZES, INDUSTRIES, PLAN_IDS } from '../../../shared/enums'
import { passwordMeetsPolicy } from '../../../shared/security'

const strongPassword = z
  .string()
  .min(8)
  .refine(passwordMeetsPolicy, 'Password must contain at least one uppercase letter and one digit')

export const registerCompanySchema = z
  .object({
    company: z.object({
      name: z.string().trim().min(2).max(80),
      industry: z.enum(INDUSTRIES),
      size: z.enum(COMPANY_SIZES),
      country: z.string().trim().min(2).max(56),
    }),
    owner: z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().toLowerCase(),
      password: strongPassword,
    }),
    plan: z.enum(PLAN_IDS),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(8),
  })
  .strict()

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(20),
  })
  .strict()

export const logoutSchema = z
  .object({
    refreshToken: z.string().min(20).optional(),
  })
  .strict()

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email().toLowerCase(),
  })
  .strict()

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20),
    password: strongPassword,
  })
  .strict()

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(20),
    name: z.string().trim().min(2).max(80),
    password: strongPassword,
  })
  .strict()

export const verifyEmailSchema = z
  .object({
    token: z.string().min(20),
  })
  .strict()

export type RegisterCompanyDTO = z.infer<typeof registerCompanySchema>
export type LoginDTO = z.infer<typeof loginSchema>
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>
export type LogoutDTO = z.infer<typeof logoutSchema>
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
export type AcceptInvitationDTO = z.infer<typeof acceptInvitationSchema>
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>
