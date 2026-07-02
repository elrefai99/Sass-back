import { EmployeeModel, SubscriptionModel } from '../../../schema'
import { getPlanSeatLimit, plans } from '../../../shared/plans'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type { UpgradePlanDTO } from '../DTO/index.dto'

export class SubscriptionService {
  async getSubscription(companyId: string) {
    const subscription = await SubscriptionModel.findOne({ companyId })
    if (!subscription) {
      throw AppError.notFound('Subscription not found', 'NOT_FOUND')
    }

    const seatsUsed = await EmployeeModel.countDocuments({ companyId, deletedAt: null })
    return {
      id: idOf(subscription),
      plan: subscription.plan,
      status: subscription.status,
      seats: subscription.seats,
      seatsUsed,
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
    }
  }

  listPlans() {
    return Object.values(plans)
  }

  async upgrade(companyId: string, actor: { id: string; name?: string }, dto: UpgradePlanDTO) {
    const targetPlan = plans[dto.plan]
    const seatLimit = getPlanSeatLimit(dto.plan)
    const seatsUsed = await EmployeeModel.countDocuments({ companyId, deletedAt: null })

    if (seatLimit !== null && seatsUsed > seatLimit) {
      throw AppError.conflict('Current seat usage exceeds target plan limit', 'CONFLICT')
    }

    await SubscriptionModel.findOneAndUpdate(
      { companyId },
      {
        plan: dto.plan,
        status: 'active',
        seats: targetPlan.seats ?? 999999,
        trialEndsAt: null,
        currentPeriodEnd: this.addMonths(new Date(), 1),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'subscription.upgraded',
      message: `Plan changed to ${dto.plan}`,
      entity: `subscription:${companyId}`,
    })

    return this.getSubscription(companyId)
  }

  private addMonths(date: Date, months: number) {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }
}

export const subscriptionService = new SubscriptionService()
