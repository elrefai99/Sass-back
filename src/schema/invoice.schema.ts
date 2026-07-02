import { Schema, model, models } from 'mongoose'
import { INVOICE_STATUSES, PLAN_IDS } from '../shared/enums'
import { datedOnlySchemaOptions } from './options'

const invoiceSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    number: { type: String, required: true, unique: true },
    stripeInvoiceId: { type: String, default: null, unique: true, sparse: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: INVOICE_STATUSES, required: true },
    planId: { type: String, enum: PLAN_IDS, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    pdfUrl: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  datedOnlySchemaOptions,
)

invoiceSchema.index({ companyId: 1, createdAt: -1 })
invoiceSchema.index({ number: 1 }, { unique: true })

export const InvoiceModel = models.Invoice || model('Invoice', invoiceSchema)
