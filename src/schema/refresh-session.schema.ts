import { Schema, model, models } from 'mongoose'
import { schemaOptions } from './options'

const refreshSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    familyId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: Date.now },
  },
  schemaOptions,
)

refreshSessionSchema.index({ tokenHash: 1 }, { unique: true })
refreshSessionSchema.index({ userId: 1 })
refreshSessionSchema.index({ familyId: 1 })

export const RefreshSessionModel = models.RefreshSession || model('RefreshSession', refreshSessionSchema)
