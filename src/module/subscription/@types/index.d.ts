export type SubscriptionView = {
  id: string
  plan: string
  status: string
  seats: number
  seatsUsed: number
  trialEndsAt: Date | null
  currentPeriodEnd: Date | null
}
