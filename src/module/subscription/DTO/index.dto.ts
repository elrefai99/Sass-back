import { z } from 'zod'
import { PLAN_IDS } from '../../../shared/enums'

export const upgradePlanSchema = z
  .object({
    plan: z.enum(PLAN_IDS).refine((plan) => plan !== 'trial', 'Cannot change back to trial'),
  })
  .strip()

export type UpgradePlanDTO = z.infer<typeof upgradePlanSchema>
