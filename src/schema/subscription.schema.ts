import { Schema, model, models } from 'mongoose'
import { PLAN_IDS, SUBSCRIPTION_STATUSES } from '../shared/enums'
import { schemaOptions } from './options'

const subscriptionSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    plan: { type: String, enum: PLAN_IDS, default: 'trial' },
    status: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'trialing' },
    seats: { type: Number, default: 10 },
    trialEndsAt: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
  },
  schemaOptions,
)

subscriptionSchema.index({ companyId: 1 }, { unique: true })

export const SubscriptionModel = models.Subscription || model('Subscription', subscriptionSchema)
