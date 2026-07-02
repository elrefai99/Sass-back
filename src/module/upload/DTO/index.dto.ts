import { z } from 'zod'

export const requestUploadUrlSchema = z
  .object({
    purpose: z.enum(['company-logo', 'user-avatar', 'attachment']),
    contentType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']),
    size: z.coerce.number().int().positive().max(2 * 1024 * 1024),
  })
  .strip()

export type RequestUploadUrlDTO = z.infer<typeof requestUploadUrlSchema>
