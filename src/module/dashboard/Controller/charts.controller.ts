import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { dashboardService } from '../Service/dashboard.service'

export const chartsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await dashboardService.charts(req.user!.companyId)
  sendSuccess(res, 'Dashboard charts fetched successfully', data)
})
