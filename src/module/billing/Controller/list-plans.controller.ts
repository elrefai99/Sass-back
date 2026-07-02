import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { billingService } from '../Service/billing.service'

export const listPlansController: RequestHandler = asyncHandler(async (_req, res) => {
  const data = billingService.listPlans()
  sendSuccess(res, 'Plans fetched successfully', data)
})
