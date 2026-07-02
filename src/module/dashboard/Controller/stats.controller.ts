import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { dashboardService } from '../Service/dashboard.service'

export const statsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await dashboardService.stats(req.user!.companyId)
  sendSuccess(res, 'Dashboard stats fetched successfully', data)
})
