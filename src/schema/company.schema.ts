import { Schema, model, models } from 'mongoose'
import { COMPANY_SIZES, INDUSTRIES, LANGUAGES } from '../shared/enums'
import { schemaOptions } from './options'

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    logoUrl: { type: String, default: null },
    industry: { type: String, enum: INDUSTRIES, required: true },
    size: { type: String, enum: COMPANY_SIZES, required: true },
    country: { type: String, required: true, trim: true },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, enum: LANGUAGES, default: 'en' },
    workdayStart: { type: String, default: '09:00' },
    onboardedAt: { type: Date, default: null },
  },
  schemaOptions,
)

companySchema.index({ slug: 1 }, { unique: true })

export const CompanyModel = models.Company || model('Company', companySchema)
