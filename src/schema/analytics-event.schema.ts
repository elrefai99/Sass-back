import { Schema, model, models } from 'mongoose'
import { DEVICE_TYPES } from '../shared/enums'
import { datedOnlySchemaOptions } from './options'

const analyticsEventSchema = new Schema(
  {
    requestId: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userEmail: { type: String, default: null },
    visitorId: { type: String, required: true },

    ip: { type: String, default: null },
    xForwardedFor: { type: String, default: null },
    userAgent: { type: String, default: null },
    browser: { type: String, default: null },
    os: { type: String, default: null },
    deviceType: { type: String, enum: DEVICE_TYPES, default: 'unknown' },

    method: { type: String, required: true },
    url: { type: String, required: true },
    route: { type: String, required: true },
    query: { type: Schema.Types.Mixed, default: null },
    body: { type: Schema.Types.Mixed, default: null },

    statusCode: { type: Number, required: true },
    responseTimeMs: { type: Number, required: true },

    referer: { type: String, default: null },
    origin: { type: String, default: null },
    host: { type: String, default: null },
    acceptLanguage: { type: String, default: null },

    country: { type: String, default: null },
    region: { type: String, default: null },
    city: { type: String, default: null },
    timezone: { type: String, default: null },
    isp: { type: String, default: null },
    asn: { type: String, default: null },

    createdAt: { type: Date, default: Date.now },
  },
  datedOnlySchemaOptions,
)

analyticsEventSchema.index({ userId: 1, createdAt: -1 })
analyticsEventSchema.index({ visitorId: 1, createdAt: -1 })
analyticsEventSchema.index({ route: 1, createdAt: -1 })
analyticsEventSchema.index({ companyId: 1, createdAt: -1 })
analyticsEventSchema.index({ createdAt: -1 })

export const AnalyticsEventModel = models.AnalyticsEvent || model('AnalyticsEvent', analyticsEventSchema)
