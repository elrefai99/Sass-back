import { z } from 'zod'
import { PLAN_IDS } from '../../../shared/enums'
import { isObjectId, objectIdSchemaMessage } from '../../../shared/document'

export const changePlanSchema = z
  .object({
    plan: z.enum(PLAN_IDS).refine((plan) => plan !== 'trial', 'Cannot change back to trial'),
  })
  .strip()

export const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
})

export const invoiceParamsSchema = z.object({
  id: z.string().refine(isObjectId, objectIdSchemaMessage),
})

export type ChangePlanDTO = z.infer<typeof changePlanSchema>
export type ListInvoicesQueryDTO = z.infer<typeof listInvoicesQuerySchema>
export type InvoiceParamsDTO = z.infer<typeof invoiceParamsSchema>
