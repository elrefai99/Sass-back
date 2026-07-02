import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { subscriptionService } from '../Service/subscription.service'

export const upgradePlanController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await subscriptionService.upgrade(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Subscription upgraded successfully', data)
})
