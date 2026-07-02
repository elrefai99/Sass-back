import { Schema, model, models } from 'mongoose'
import { schemaOptions } from './options'

const emailVerificationTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  schemaOptions,
)

emailVerificationTokenSchema.index({ tokenHash: 1 }, { unique: true })

export const EmailVerificationTokenModel =
  models.EmailVerificationToken || model('EmailVerificationToken', emailVerificationTokenSchema)
