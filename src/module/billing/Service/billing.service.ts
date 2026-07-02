import { generateUUID } from '../../../utils/uuid'
import { EmployeeModel, InvoiceModel, SubscriptionModel } from '../../../schema'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { getPlanSeatLimit, plans } from '../../../shared/plans'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type { ChangePlanDTO, ListInvoicesQueryDTO } from '../DTO/index.dto'

export class BillingService {
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

  async changePlan(companyId: string, actor: { id: string; name?: string }, dto: ChangePlanDTO) {
    const targetPlan = plans[dto.plan]
    const seatLimit = getPlanSeatLimit(dto.plan)
    const seatsUsed = await EmployeeModel.countDocuments({ companyId, deletedAt: null })

    if (seatLimit !== null && seatsUsed > seatLimit) {
      throw AppError.conflict('Current seat usage exceeds target plan limit', 'CONFLICT')
    }

    const subscription = await SubscriptionModel.findOneAndUpdate(
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

    await InvoiceModel.create({
      companyId,
      number: `INV-${Date.now()}-${generateUUID().slice(0, 6)}`,
      amount: targetPlan.priceMonthly,
      status: 'open',
      planId: dto.plan,
      periodStart: new Date(),
      periodEnd: subscription.currentPeriodEnd,
      pdfUrl: null,
    })

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'billing.plan_changed',
      message: `Plan changed to ${dto.plan}`,
      entity: `subscription:${idOf(subscription)}`,
    })

    return this.getSubscription(companyId)
  }

  async listInvoices(companyId: string, query: ListInvoicesQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const [invoices, total] = await Promise.all([
      InvoiceModel.find({ companyId }).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      InvoiceModel.countDocuments({ companyId }),
    ])

    return {
      data: invoices.map((invoice) => this.serializeInvoice(invoice)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async downloadInvoice(companyId: string, invoiceId: string) {
    const invoice = await InvoiceModel.findOne({ _id: invoiceId, companyId })
    if (!invoice) {
      throw AppError.notFound('Invoice not found', 'NOT_FOUND')
    }

    return {
      invoice: this.serializeInvoice(invoice),
      pdfUrl: invoice.pdfUrl,
    }
  }

  async handleWebhook(payload: unknown) {
    return {
      received: true,
      payload,
    }
  }

  private serializeInvoice(invoice: any) {
    return {
      id: idOf(invoice),
      number: invoice.number,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      planId: invoice.planId,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      pdfUrl: invoice.pdfUrl ?? null,
      createdAt: invoice.createdAt,
    }
  }

  private addMonths(date: Date, months: number) {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }
}

export const billingService = new BillingService()
