import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { subscriptionService } from '../Service/subscription.service'

export const listPlansController: RequestHandler = asyncHandler(async (_req, res) => {
  const data = subscriptionService.listPlans()
  sendSuccess(res, 'Plans fetched successfully', data)
})
