import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { billingService } from '../Service/billing.service'

export const listInvoicesController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await billingService.listInvoices(req.user!.companyId, req.query as any)
  sendSuccess(res, 'Invoices fetched successfully', result.data, 200, result.meta)
})
