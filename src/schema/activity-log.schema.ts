import { Schema, model, models } from 'mongoose'
import { datedOnlySchemaOptions } from './options'

const activityLogSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorName: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    entity: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  datedOnlySchemaOptions,
)

activityLogSchema.index({ companyId: 1, createdAt: -1 })

export const ActivityLogModel = models.ActivityLog || model('ActivityLog', activityLogSchema)
