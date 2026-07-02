import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { billingService } from '../Service/billing.service'

export const stripeWebhookController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await billingService.handleWebhook(req.body)
  sendSuccess(res, 'Webhook received', data)
})
