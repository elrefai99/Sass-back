import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { billingService } from '../Service/billing.service'

export const getSubscriptionController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await billingService.getSubscription(req.user!.companyId)
  sendSuccess(res, 'Subscription fetched successfully', data)
})
