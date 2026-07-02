import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { billingService } from '../Service/billing.service'

export const downloadInvoicePdfController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await billingService.downloadInvoice(req.user!.companyId, String(req.params.id))
  sendSuccess(res, 'Invoice PDF fetched successfully', data)
})
