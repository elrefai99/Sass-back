import { z } from 'zod'

export const dashboardActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export type DashboardActivityQueryDTO = z.infer<typeof dashboardActivityQuerySchema>
