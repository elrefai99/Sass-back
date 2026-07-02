import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { subscriptionService } from '../Service/subscription.service'

export const getSubscriptionController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await subscriptionService.getSubscription(req.user!.companyId)
  sendSuccess(res, 'Subscription fetched successfully', data)
})
