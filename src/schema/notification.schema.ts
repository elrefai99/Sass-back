import { Schema, model, models } from 'mongoose'
import { NOTIFICATION_TYPES } from '../shared/enums'
import { datedOnlySchemaOptions } from './options'

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  datedOnlySchemaOptions,
)

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

export const NotificationModel = models.Notification || model('Notification', notificationSchema)
