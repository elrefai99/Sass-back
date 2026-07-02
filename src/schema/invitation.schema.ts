import { Schema, model, models } from 'mongoose'
import { INVITATION_STATUSES, SYSTEM_ROLES } from '../shared/enums'
import { schemaOptions } from './options'

const invitationSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: SYSTEM_ROLES, default: 'employee' },
    tokenHash: { type: String, required: true, unique: true },
    status: { type: String, enum: INVITATION_STATUSES, default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  schemaOptions,
)

invitationSchema.index({ companyId: 1, email: 1 }, { unique: true })
invitationSchema.index({ tokenHash: 1 }, { unique: true })

export const InvitationModel = models.Invitation || model('Invitation', invitationSchema)
