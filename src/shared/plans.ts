import type { PlanId } from './enums'

export const plans: Record<
  PlanId,
  {
    id: PlanId
    name: string
    priceMonthly: number
    seats: number | null
    trialDays?: number
  }
> = {
  trial: {
    id: 'trial',
    name: 'Trial',
    priceMonthly: 0,
    seats: 10,
    trialDays: 14,
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 29,
    seats: 50,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 79,
    seats: null,
  },
}

export const getPlanSeatLimit = (planId: PlanId): number | null => plans[planId].seats
