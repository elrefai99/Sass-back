import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { billingService } from '../Service/billing.service'

export const changePlanController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await billingService.changePlan(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Plan changed successfully', data)
})
